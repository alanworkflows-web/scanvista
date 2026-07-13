import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import { prisma } from "./src/lib/db";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import crypto from "crypto";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export interface Entitlement {
  plan: "free" | "premium";
  subscriptionStatus: "none" | "active" | "trialing" | "past_due" | "canceled" | "expired";
  accessMode: "full" | "read_only";
  canEdit: boolean;
  canPublish: boolean;
}

export function resolveEntitlement(subscription: any): Entitlement {
  if (!subscription || !subscription.status || subscription.status === "none") {
    return { plan: "free", subscriptionStatus: "none", accessMode: "full", canEdit: true, canPublish: true };
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    return { plan: "premium", subscriptionStatus: subscription.status, accessMode: "full", canEdit: true, canPublish: true };
  }

  return { plan: "premium", subscriptionStatus: subscription.status, accessMode: "read_only", canEdit: false, canPublish: false };
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isDev = process.env.NODE_ENV !== "production";

  if (!process.env.SESSION_SECRET) {
    if (isDev) {
      process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
    } else {
      console.error("SESSION_SECRET must be set in production");
      throw new Error("SESSION_SECRET must be set in production");
    }
  }

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  app.set("trust proxy", true);

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", apiLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
  });
  app.use("/auth/", authLimiter);

  const paddle = new Paddle(process.env.PADDLE_API_KEY || "test", {
    environment: isDev ? Environment.sandbox : Environment.production,
  });

  // Shared Webhook Handler
  const handlePaddleWebhook = async (req: express.Request, res: express.Response) => {
    try {
      const signature = req.headers['paddle-signature'] as string;
      const rawBody = req.body.toString('utf8');
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET;

      console.log("BEGIN PADDLE AUDIT");
      console.log(`process.env.PADDLE_WEBHOOK_SECRET exists: ${!!secretKey}`);
      if (secretKey) {
        console.log(`process.env.PADDLE_WEBHOOK_SECRET.length: ${secretKey.length}`);
        if (secretKey.length > 40) {
          const maskedSecret = secretKey.substring(0, 20) + "****" + secretKey.slice(-20);
          console.log(`Masked Secret: ${maskedSecret}`);
        } else {
          console.log(`Masked Secret: Secret is too short to mask securely`);
        }
      }
      console.log(`typeof req.body: ${typeof req.body}`);
      console.log(`Buffer.isBuffer(req.body): ${Buffer.isBuffer(req.body)}`);
      console.log(`req.body.length: ${req.body ? req.body.length : 0}`);
      console.log(`rawBody length: ${rawBody ? rawBody.length : 0}`);
      console.log(`req.headers["paddle-signature"] exists: ${!!req.headers['paddle-signature']}`);
      console.log(`Signature length: ${signature ? signature.length : 0}`);
      console.log(`req.headers["content-type"]: ${req.headers['content-type']}`);
      console.log(`req.headers["content-length"]: ${req.headers['content-length']}`);

      if (!secretKey) {
        console.error("CRITICAL: PADDLE_WEBHOOK_SECRET is not set in the environment.");
        console.log("END PADDLE AUDIT");
        return res.status(500).send("Webhook configuration error");
      }

      let eventData;
      try {
        eventData = paddle.webhooks.unmarshal(rawBody, secretKey, signature || '');
        console.log("UNMARSHAL SUCCESS");
        console.log("END PADDLE AUDIT");
      } catch (e: any) {
        console.log(`error.name: ${e.name}`);
        console.log(`error.message: ${e.message}`);
        console.log("END PADDLE AUDIT");
        throw new Error("Invalid signature sync");
      }
      
      if (eventData instanceof Promise) {
        eventData = await eventData;
      }

      console.log("=== BEGIN SDK PAYLOAD DUMP ===");
      console.dir(eventData, { depth: null });
      console.log("=== END SDK PAYLOAD DUMP ===");

      const eventId = eventData?.eventId || eventData?.id;
      if (eventId) {
        try {
          await prisma.webhookEvent.create({ data: { id: eventId, type: eventData.eventType || 'unknown' } });
        } catch (e: any) {
          if (e.code === 'P2002') {
            return res.status(200).send("OK");
          }
          throw e;
        }
      }

      console.log(`1. Parsed eventType: ${eventData?.eventType}`);

      // Use explicit casting to the SDK's expected generic payload shape to access camelCase properties correctly
      const payload = eventData?.data as any; // Cast as any first to satisfy strict TypeScript before checking properties, but use camelCase below
      
      console.log(`2. Log customData:`, payload?.customData);

      if (payload && payload.customData && payload.customData.slug) {
        const slug = payload.customData.slug;
        console.log(`3. Log slug: ${slug}`);

        const status = payload.status;

        const validStatuses = ['active', 'trialing', 'canceled', 'past_due'];
        if (!status || !validStatuses.includes(status)) {
          return res.status(200).send("Unsupported or missing status safely ignored");
        }

        const customerId = payload.customerId;
        const subscriptionId = payload.id;
        // Other SDK properties if we needed them: businessId, addressId, scheduledChange, transactionId

        const property = await prisma.property.findUnique({ where: { slug } });
        console.log(`4. Log property lookup: ${property ? property.id : 'NOT_FOUND'}`);

        if (property) {
          await prisma.subscription.upsert({
            where: { propertyId: property.id },
            update: {
              status: status,
              paddleCustomerId: customerId,
              paddleSubscriptionId: subscriptionId
            },
            create: {
              propertyId: property.id,
              status: status,
              paddleCustomerId: customerId,
              paddleSubscriptionId: subscriptionId
            }
          });
          console.log(`5. Log subscription upsert: UPSERTED for ${property.id}`);
          console.log(`6. Log entitlement refresh: REFRESHED for ${slug} (status: ${status})`);
        }
      }
      res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook Error:", err);
      res.status(400).send("Webhook Error");
    }
  };

  // Webhook needs raw body - bind to both paths for compatibility
  app.post("/webhooks/paddle", express.raw({ type: 'application/json' }), handlePaddleWebhook);
  app.post("/api/paddle/webhook", express.raw({ type: 'application/json' }), handlePaddleWebhook);

  // Standard parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  // ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    ),
    cookie: {
      secure: process.env.NODE_ENV === 'production' || !!process.env.APP_URL,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' || !!process.env.APP_URL ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Auth middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // @ts-ignore
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Zod schemas
  const PropertySchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    bannerUrl: z.string().url().max(1000).optional().or(z.literal("")),
    receptionPhone: z.string().max(50).optional(),
    roomServicePhone: z.string().max(50).optional(),
    housekeepingPhone: z.string().max(50).optional(),
    emergencyPhone: z.string().max(50).optional(),
  });

  const AmenitySchema = z.object({
    name: z.string().trim().min(1).max(255),
    description: z.string().max(1000).optional(),
    openTime: z.string().max(20).optional(),
    closeTime: z.string().max(20).optional(),
    requiresReservation: z.boolean().optional(),
  });

  const DishSchema = z.object({
    name: z.string().trim().min(1).max(255),
    price: z.number().min(0),
    allergens: z.string().optional(),
    healthTips: z.string().optional(),
    isOutOfStock: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
  });

  const CategorySchema = z.object({
    name: z.string().trim().min(1).max(255),
  });

  // OAuth Setup
  let googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
  if (!googleCallbackUrl) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw new Error("GOOGLE_CALLBACK_URL must be set in production");
    } else {
      googleCallbackUrl = "http://localhost:3000/auth/google/callback";
    }
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID?.trim(),
    process.env.GOOGLE_CLIENT_SECRET?.trim(),
    googleCallbackUrl?.trim()
  );


  app.get("/auth/google", async (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      if (process.env.NODE_ENV === "production") {
        console.error("CRITICAL: GOOGLE_CLIENT_ID missing in production.");
        return res.status(500).send("Authentication is currently unavailable. Please configure GOOGLE_CLIENT_ID.");
      }
      console.warn("⚠️ GOOGLE_CLIENT_ID not configured, using development bypass login");

      const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
          email: "demo@example.com",
          name: "Demo Manager",
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          googleId: "demo-google-id",
        }
      });

      const rawReturnTo = req.query.returnTo as string;
      const allowedPrefixes = ['/manager/setup', '/manager/operations', '/manager/qr', '/manager/plan'];
      let safeReturnTo = '/manager/setup';
      if (rawReturnTo && allowedPrefixes.some(p => rawReturnTo.startsWith(p))) {
         safeReturnTo = rawReturnTo;
      }

      // @ts-ignore
      req.session.regenerate((err) => {
        if (err) return res.status(500).send("Session error");
        // @ts-ignore
        req.session.userId = user.id;
        // @ts-ignore
        req.session.save((saveErr) => {
          if (saveErr) return res.status(500).send("Session save error");
          return res.redirect(safeReturnTo);
        });
      });
      return;
    }    const state = crypto.randomBytes(32).toString('hex');
    const stateHash = crypto.createHash('sha256').update(state).digest('hex');
    const rawReturnTo = req.query.returnTo as string;
    const allowedPrefixes = ['/manager/setup', '/manager/operations', '/manager/qr', '/manager/plan'];
    let safeReturnTo = '/manager/setup';
    if (rawReturnTo && allowedPrefixes.some(p => rawReturnTo.startsWith(p))) {
       safeReturnTo = rawReturnTo;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins TTL

    try {
      await prisma.oAuthState.create({
        data: {
          stateHash,
          returnTo: safeReturnTo,
          expiresAt
        }
      });
      // Cleanup expired states opportunistically
      await prisma.oAuthState.deleteMany({
        where: { expiresAt: { lt: now } }
      });
    } catch (dbErr) {
      console.error("OAuth init DB error:", dbErr);
      return res.status(500).send("Failed to initialize OAuth state");
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      state: state
    });

    // Session save for other data is not strictly required here if we didn't mutate it,
    // but just to be safe if express-session updated the cookie expiry:
    req.session.save((err) => {
      if (err) {
        console.error("Session save error before redirect:", err);
      }
      res.redirect(url);
    });
  });


  app.get("/auth/google/callback", async (req, res) => {
    try {
      const queryState = req.query.state as string;
      const stateHash = queryState ? crypto.createHash('sha256').update(queryState).digest('hex') : 'none';
      const errorHtml = `
        <div style="font-family: sans-serif; max-width: 400px; margin: 40px auto; text-align: center;">
          <h2>Session Expired</h2>
          <p style="color: #666; margin-bottom: 24px;">Your sign-in session expired or another sign-in attempt replaced it. Please try again.</p>
          <a href="/manager" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-bottom: 12px; width: 100%; box-sizing: border-box;">Try Google Sign-In Again</a>
          <br/>
          <a href="/" style="color: #666; text-decoration: none; font-size: 14px;">Back to Home</a>
        </div>
      `;

      if (!queryState) {
        return res.status(400).send(errorHtml);
      }

      const now = new Date();
      // Atomic consume: update exactly one record that hasn't been consumed and isn't expired
      const consumeResult = await prisma.oAuthState.updateMany({
        where: {
          stateHash,
          consumedAt: null,
          expiresAt: { gt: now }
        },
        data: {
          consumedAt: now
        }
      });

      if (consumeResult.count !== 1) {
        return res.status(400).send(errorHtml);
      }

      // Fetch the verified state data
      const stateData = await prisma.oAuthState.findUnique({
        where: { stateHash }
      });
      const returnTo = stateData?.returnTo || "/manager/setup";
      const { tokens } = await oauth2Client.getToken(req.query.code as string);
      oauth2Client.setCredentials(tokens);

      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).send("Failed to get user payload");
      }

      const user = await prisma.user.upsert({
        where: { email: payload.email },
        update: {
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub
        },
        create: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub,
        }
      });

      // Safe returnTo retrieved from state data

      // @ts-ignore
      req.session.regenerate((err) => {
        if (err) return res.status(500).send("Session error");
        // @ts-ignore
        req.session.userId = user.id;
        // @ts-ignore
        req.session.save((saveErr) => {
          if (saveErr) return res.status(500).send("Session save error");
          return res.redirect(returnTo);
        });
      });
    } catch (err: any) {
      console.error("OAuth Callback Error Diagnostic:");
      console.error(`- Error Name: ${err?.name || "Unknown"}`);
      console.error(`- Error Message: ${err?.message || "Unknown error"}`);
      console.error(`- Provider Status/Code: ${err?.code || err?.response?.status || "N/A"}`);
      console.error(`- Failing Stage: ${err?.stack?.includes('getToken') ? 'Token Exchange' : err?.stack?.includes('verifyIdToken') ? 'Profile Fetch' : 'Database/Session Provisioning'}`);
      res.status(500).send("Login failed");
    }
  });

  app.post("/api/logout", (req, res) => {
    // @ts-ignore
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // Properties API
  app.get("/api/properties/:slug", async (req, res) => {
    try {
      const slug = req.params.slug.toLowerCase();
      const property = await prisma.property.findUnique({
        where: { slug },
        include: {
          amenities: true,
          categories: {
            include: { dishes: true },
            orderBy: { displayOrder: 'asc' }
          },
          subscription: true
        }
      });

      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const categories = property.categories;
      const dishes = property.categories.flatMap(c => c.dishes);
      const amenities = property.amenities;
      const entitlement = resolveEntitlement(property.subscription);

      const safeProperty = {
        id: property.id,
        slug: property.slug,
        name: property.name,
        description: property.description,
        bannerUrl: property.bannerUrl,
        propertyType: property.propertyType,
        wifiNetwork: property.wifiNetwork,
        wifiPassword: property.wifiPassword,
        hostInfo: property.hostInfo,
        houseRules: property.houseRules,
        experiences: property.experiences,
        receptionPhone: property.receptionPhone,
        housekeepingPhone: property.housekeepingPhone,
        emergencyPhone: property.emergencyPhone,
        roomServicePhone: property.roomServicePhone,
        entitlement
      };

      res.json({
        property: safeProperty,
        categories,
        dishes,
        amenities,
        grievances: []
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.get("/api/manager/properties", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const properties = await prisma.property.findMany({
        // @ts-ignore
        where: { ownerId: req.session.userId },
        include: { subscription: true }
      });
      res.json(properties.map(p => ({
        ...p,
        entitlement: resolveEntitlement(p.subscription)
      })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });
  async function generateUniqueSlug(baseName: string): Promise<string> {
    let base = baseName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!base || base.length === 0) {
      base = "property";
    }

    base = base.substring(0, 50).replace(/-$/, "");

    let slug = base;
    let counter = 2;
    let isUnique = false;

    while (!isUnique && counter < 100) {
      const existing = await prisma.property.findUnique({ where: { slug } });
      if (!existing) {
        isUnique = true;
      } else {
        slug = `${base}-${counter}`;
        counter++;
      }
    }

    if (!isUnique) {
      slug = `${base}-${crypto.randomBytes(4).toString('hex')}`;
    }

    return slug;
  }

  app.post("/api/manager/properties", requireAuth, async (req, res) => {
    try {
      const name = String(req.body.name || 'New Property');
      const slug = await generateUniqueSlug(name);
      // @ts-ignore
      const property = await prisma.property.create({
        data: {
          name,
          slug,
          // @ts-ignore
          ownerId: req.session.userId,
        },
        include: { subscription: true }
      });
      res.json({
        ...property,
        entitlement: resolveEntitlement(property.subscription)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.put("/api/manager/properties/:slug", requireAuth, async (req, res) => {
    try {
      const validatedData = PropertySchema.parse(req.body);

      // Check Entitlement before allowing edits
      const currentProperty = await prisma.property.findUnique({
        where: { slug: req.params.slug },
        include: { subscription: true }
      });
      if (!currentProperty || currentProperty.ownerId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden or property not found" });
      }

      const entitlement = resolveEntitlement(currentProperty.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      // Use updateMany for atomic ownership checking (prevents IDOR)
      // @ts-ignore
      const result = await prisma.property.updateMany({
        where: {
          slug: req.params.slug,
          // @ts-ignore
          ownerId: req.session.userId
        },
        data: validatedData
      });

      if (result.count === 0) {
        return res.status(403).json({ error: "Forbidden or property not found" });
      }

      const property = await prisma.property.findUnique({ where: { slug: req.params.slug } });
      res.json(property);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // Billing Portal
  app.post("/api/manager/properties/:slug/portal", requireAuth, async (req, res) => {
    console.log("PORTAL ROUTE VERSION a3f5b8d");
    console.log("=== BILLING PORTAL ENDPOINT HIT ===");
    try {
      // @ts-ignore
      const { userId } = req.session;
      const { slug } = req.params;

      const property = await prisma.property.findUnique({
        where: { slug },
        include: { subscription: true }
      });

      if (!property || property.ownerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!property.subscription || !property.subscription.paddleCustomerId) {
        return res.status(400).json({ error: "No billing customer found" });
      }

      const env = process.env.PADDLE_ENV;
      const apiKey = process.env.PADDLE_API_KEY;

      if (!env || !apiKey) {
        return res.status(500).json({ error: "Billing API not configured" });
      }

      const apiUrl = env === 'production'
        ? `https://api.paddle.com/customers/${property.subscription.paddleCustomerId}/portal-sessions`
        : `https://sandbox-api.paddle.com/customers/${property.subscription.paddleCustomerId}/portal-sessions`;

      console.log("API Key starts with:", apiKey.substring(0, 12));
      console.log("API Key length:", apiKey.length);
      console.log(
        "Authorization header:",
        `Bearer ${apiKey.substring(0, 12)}...`
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subscription_ids: property.subscription.paddleSubscriptionId ? [property.subscription.paddleSubscriptionId] : []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        console.error("========== PADDLE PORTAL ERROR ==========");
        console.error("HTTP:", response.status);
        console.error("BODY:", errorText);
        
        return res.status(response.status).json({
          paddleStatus: response.status,
          paddleError: errorText
        });
      }

      const data = await response.json();
      console.dir(data, { depth: null });

      // Paddle Billing v2 returns specific action URLs instead of a generic .url field
      const generalUrl = data?.data?.urls?.general?.overview;
      const subscriptionUrl = data?.data?.urls?.subscriptions?.[0]?.update_subscription_payment_method;
      
      const portalUrl = generalUrl || subscriptionUrl;

      if (portalUrl) {
        return res.json({ url: portalUrl });
      }

      throw new Error("Invalid response from billing provider: Missing URL");
    } catch (err: any) {
      console.error("========== BILLING PORTAL EXCEPTION ==========");
      console.error(err);
      console.error(err?.message);
      console.error(err?.stack);

      return res.status(500).json({
        error: err?.message || "Unknown error"
      });
    }
  });

  // CRUD Amenities & Dishes via Slug
  app.post("/api/manager/properties/:slug/amenities", requireAuth, async (req, res) => {
    try {
      const validatedData = AmenitySchema.parse(req.body);
      const property = await prisma.property.findFirst({
        // @ts-ignore
        where: { slug: req.params.slug, ownerId: req.session.userId }
      });
      if (!property) return res.status(403).json({ error: "Unauthorized" });

      const amenity = await prisma.amenity.create({ data: { ...validatedData, propertyId: property.id } });
      res.json(amenity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      res.status(500).json({ error: "Failed to create amenity" });
    }
  });

  app.put("/api/manager/amenities/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const amenity = await prisma.amenity.findUnique({ where: { id }, include: { property: { include: { subscription: true } } } });
    if (!amenity || amenity.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(amenity.property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    const updated = await prisma.amenity.update({ where: { id }, data: req.body });
    res.json(updated);
  });

  app.delete("/api/manager/amenities/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const amenity = await prisma.amenity.findUnique({ where: { id }, include: { property: true } });
    if (!amenity || amenity.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

    const property = await prisma.property.findUnique({ where: { id: amenity.propertyId }, include: { subscription: true } });
    const entitlement = resolveEntitlement(property?.subscription || null);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    await prisma.amenity.delete({ where: { id } });
    res.json({ success: true });
  });

  app.post("/api/manager/properties/:slug/dishes", requireAuth, async (req, res) => {
    try {
      const validatedData = DishSchema.parse(req.body);
      const property = await prisma.property.findFirst({
        // @ts-ignore
        where: { slug: req.params.slug, ownerId: req.session.userId },
        include: { categories: true, subscription: true }
      });
      if (!property) return res.status(403).json({ error: "Unauthorized" });

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      let categoryId = validatedData.categoryId;
      if (!categoryId) {
        if (property.categories.length > 0) {
          categoryId = property.categories[0].id;
        } else {
          const newCat = await prisma.menuCategory.create({
            data: { propertyId: property.id, name: "General" }
          });
          categoryId = newCat.id;
        }
      }

      const dish = await prisma.dish.create({
        data: {
          name: validatedData.name,
          price: validatedData.price,
          allergens: validatedData.allergens || "[]",
          healthTips: validatedData.healthTips || "",
          isOutOfStock: validatedData.isOutOfStock || false,
          categoryId
        }
      });
      res.json(dish);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      console.error(err);
      res.status(500).json({ error: "Failed to create dish" });
    }
  });

  app.put("/api/manager/dishes/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: { category: { include: { property: { include: { subscription: true } } } } }
    });
    if (!dish || dish.category.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(dish.category.property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    const updated = await prisma.dish.update({ where: { id }, data: req.body });
    res.json(updated);
  });

  app.delete("/api/manager/dishes/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: { category: { include: { property: { include: { subscription: true } } } } }
    });
    if (!dish || dish.category.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(dish.category.property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    await prisma.dish.delete({ where: { id } });
    res.json({ success: true });
  });

  // Category Endpoints
  app.post("/api/manager/properties/:slug/categories", requireAuth, async (req, res) => {
    try {
      const validatedData = CategorySchema.parse(req.body);
      const property = await prisma.property.findFirst({
        // @ts-ignore
        where: { slug: req.params.slug, ownerId: req.session.userId },
        include: { subscription: true }
      });
      if (!property) return res.status(403).json({ error: "Unauthorized" });

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

      const category = await prisma.menuCategory.create({
        data: { name: validatedData.name, propertyId: property.id }
      });
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/manager/categories/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = CategorySchema.parse(req.body);
      // @ts-ignore
      const { userId } = req.session;
      const { id } = req.params;

      const category = await prisma.menuCategory.findUnique({
        where: { id },
        include: { property: { include: { subscription: true } } }
      });
      if (!category || category.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

      const entitlement = resolveEntitlement(category.property.subscription);
      if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

      const updated = await prisma.menuCategory.update({
        where: { id },
        data: { name: validatedData.name }
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/manager/categories/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: { dishes: true, property: { include: { subscription: true } } }
    });
    if (!category || category.property.ownerId !== userId) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(category.property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    if (category.dishes.length > 0) {
      return res.status(400).json({ error: "Cannot delete category with dishes attached." });
    }

    await prisma.menuCategory.delete({ where: { id } });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  return app;
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export { startServer };
