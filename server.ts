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
  maxCategories: number;
  maxDishes: number;
}

export function resolveEntitlement(subscription: any): Entitlement {
  if (!subscription || !subscription.status || subscription.status === "none") {
    return { plan: "free", subscriptionStatus: "none", accessMode: "full", canEdit: true, canPublish: true, maxCategories: 2, maxDishes: 10 };
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    return { plan: "premium", subscriptionStatus: subscription.status, accessMode: "full", canEdit: true, canPublish: true, maxCategories: 1000, maxDishes: 10000 };
  }

  return { plan: "premium", subscriptionStatus: subscription.status, accessMode: "read_only", canEdit: false, canPublish: false, maxCategories: 1000, maxDishes: 10000 };
}

async function startServer() {
  
function logAuthLookup(req, property, endpoint) {
  console.log(`=== AUTHENTICATION DIAGNOSTIC (${endpoint}) ===`);
  console.log(`- req.session.userId: `, req.session?.userId);
  console.log(`- property: `, property ? {
    id: property.id,
    slug: property.slug,
    ownerId: property.ownerId,
    orgId: property.orgId
  } : null);
  if (property && req.session?.userId) {
    console.log(`- owner matches userId?: `, property.ownerId === req.session.userId);
  }
  console.log(`===============================================`);
}

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
  
  const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1500, // Generous limit for public guest views (100 req/min)
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/manager", apiLimiter);
  app.use("/api/properties", publicApiLimiter);

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
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Auth middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.TEST_MODE === "true") {
      // @ts-ignore
      req.session.userId = "test-user-id";
      return next();
    }
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
    bannerUrl: z.string().optional().nullable().or(z.literal("")),
    heroImage: z.string().optional().nullable().or(z.literal("")),
    logoUrl: z.string().optional().nullable().or(z.literal("")),
    propertyType: z.enum(["HOTEL", "HOMESTAY", "RESORT", "RETREAT"]).optional(),
    wifiNetwork: z.string().max(100).optional(),
    wifiPassword: z.string().max(100).optional(),
    hostInfo: z.string().max(2000).optional(),
    houseRules: z.string().max(2000).optional(),
    experiences: z.string().max(2000).optional(),
    receptionPhone: z.string().max(50).optional(),
    roomServicePhone: z.string().max(50).optional(),
    housekeepingPhone: z.string().max(50).optional(),
    emergencyPhone: z.string().max(50).optional(),
    tagline: z.string().max(255).optional(),
    welcomeMessage: z.string().max(2000).optional(),
    checkInTime: z.string().max(50).optional(),
    checkOutTime: z.string().max(50).optional(),
    paymentMethods: z.any().optional(),
    wifiCoverage: z.string().max(1000).optional(),
    wifiTroubleshooting: z.string().max(2000).optional(),
    contacts: z.any().optional(),
    conciergeServices: z.any().optional(),
    hotelRules: z.any().optional(),
    galleryImages: z.any().optional(),
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
    displayOrder: z.number().optional(),
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

      // Handle Double Requests gracefully
      // @ts-ignore
      if (req.session && req.session.userId) {
        // User is already logged in (likely a browser double-request)
        return res.redirect('/manager/setup');
      }

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

      // Ensure user has an Organization
      let membership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id }
      });
      
      if (!membership) {
        const orgName = user.name ? `${user.name.split(' ')[0]}'s Organization` : 'My Organization';
        const newOrg = await prisma.organization.create({
          data: { name: orgName, slug: await generateUniqueOrgSlug(orgName) }
        });
        membership = await prisma.organizationMembership.create({
          data: {
            userId: user.id,
            orgId: newOrg.id,
            role: 'OWNER'
          }
        });
      }

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
  const publicPropertyCache = new Map<string, { data: any, timestamp: number }>();

  app.get("/api/properties/:slug", async (req, res) => {
    try {
      const slug = req.params.slug.toLowerCase();

      // Basic memory cache (TTL: 30s)
      const cached = publicPropertyCache.get(slug);
      if (cached && Date.now() - cached.timestamp < 30000) {
        return res.json(cached.data);
      }

      const property = await prisma.property.findUnique({
        where: { slug },
        include: {
          amenities: true,
          categories: {
            include: { dishes: true },
            orderBy: { displayOrder: 'asc' }
          },
          subscription: true,
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1,
            select: { id: true, publishedAt: true }
          }
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
        bannerUrl: property.bannerUrl || property.heroImage,
        heroImage: property.heroImage || property.bannerUrl,
        logoUrl: property.logoUrl,
        previewToken: property.previewToken,
        propertyType: property.propertyType,
        wifiNetwork: property.wifiNetwork,
        wifiPassword: property.wifiPassword,
        hostInfo: property.hostInfo,
        houseRules: property.houseRules,
        hotelRules: property.hotelRules,
        contacts: property.contacts,
        experiences: property.experiences,
        receptionPhone: property.receptionPhone,
        housekeepingPhone: property.housekeepingPhone,
        emergencyPhone: property.emergencyPhone,
        roomServicePhone: property.roomServicePhone,
        tagline: property.tagline,
        welcomeMessage: property.welcomeMessage,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
        // Published state – used by frontend to gate QR distribution
        isPublished: property.snapshots.length > 0,
        snapshotCount: property.snapshots.length,
        lastPublishedAt: property.snapshots[0]?.publishedAt ?? null,
        snapshots: property.snapshots,
        entitlement
      };

      const responseData = {
        property: safeProperty,
        categories,
        dishes,
        amenities,
        grievances: []
      };

      publicPropertyCache.set(slug, { data: responseData, timestamp: Date.now() });
      res.json(responseData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.get("/api/preview/:token", async (req, res) => {
    try {
      const { token } = req.params;
      let property = await prisma.property.findFirst({
        where: { OR: [{ previewToken: token }, { slug: token }] },
        include: {
          amenities: true,
          categories: { include: { dishes: true } },
          subscription: true
        }
      });
      if (!property) return res.status(404).json({ error: "Invalid preview token" });

      const safeGuest = {
        token: 'preview-mode',
        name: 'Manager Preview',
        status: 'PREVIEW',
        property: {
          ...property,
          heroImage: property.heroImage || property.bannerUrl,
          bannerUrl: property.bannerUrl || property.heroImage
        }
      };
      res.json(safeGuest);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch preview" });
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

  // Guest Management APIs
  const isoDatetime = z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Must be a valid ISO 8601 date" });
  const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
  const guestSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().regex(phoneRegex, "Invalid phone number format").optional().nullable().or(z.literal("")),
    roomNumber: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    arrivalDate: isoDatetime.optional().nullable(),
    departureDate: isoDatetime.optional().nullable(),
    arrivalTime: isoDatetime.optional().nullable(),
    notes: z.string().optional().nullable(),
    preferences: z.any().optional(),
    communication: z.any().optional(),
    status: z.enum(["BOOKED", "ARRIVING", "CHECKED_IN", "STAYING", "CHECKED_OUT"]).optional()
  }).refine((data) => {
    if (data.arrivalDate && data.departureDate) {
      return new Date(data.arrivalDate) < new Date(data.departureDate);
    }
    return true;
  }, { message: "Departure date must be after arrival date", path: ["departureDate"] });

  app.get("/api/manager/properties/:slug/guests", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const property = await prisma.property.findUnique({
        where: { slug },
        // @ts-ignore
        select: { id: true, ownerId: true }
      });
      // @ts-ignore
      if (!property || property.ownerId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      let guests = await prisma.guest.findMany({
        where: { propertyId: property.id },
        orderBy: { arrivalDate: 'asc' }
      });
      
      const now = new Date();
      // Auto-update statuses
      const updates = guests.map(async (guest) => {
        let newStatus = guest.status;
        
        if (guest.status === "BOOKED" && guest.arrivalDate) {
          const arr = new Date(guest.arrivalDate);
          if (arr.toDateString() === now.toDateString() || arr < now) {
            newStatus = "ARRIVING";
          }
        }
        
        if (guest.status === "CHECKED_IN") {
          // Check-in + 30 min -> STAYING
          const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
          if (guest.updatedAt < thirtyMinsAgo) {
            newStatus = "STAYING";
          }
        }

        // NOTE: Checkout -> CHECKED_OUT is usually a manual trigger from receptionist.

        if (newStatus !== guest.status) {
          guest.status = newStatus;
          await prisma.guest.update({ where: { id: guest.id }, data: { status: newStatus as any } });
        }
        return guest;
      });
      
      guests = await Promise.all(updates);
      res.json(guests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.post("/api/manager/properties/:slug/guests", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const property = await prisma.property.findUnique({
        where: { slug },
        // @ts-ignore
        select: { id: true, ownerId: true }
      });
      // @ts-ignore
      if (!property || property.ownerId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const data = guestSchema.parse(req.body);

      const guest = await prisma.guest.create({
        data: {
          ...data,
          phone: data.phone || "",
          propertyId: property.id,
          arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
          departureDate: data.departureDate ? new Date(data.departureDate) : null,
          arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
        }
      });
      res.json(guest);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: err.issues });
      }
      res.status(500).json({ error: "Failed to create guest" });
    }
  });

  app.patch("/api/manager/guests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const guest = await prisma.guest.findUnique({
        where: { id },
        include: { property: true }
      });
      // @ts-ignore
      if (!guest || guest.property.ownerId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Allow partial updates
      const data = guestSchema.partial().parse(req.body);

      const updateData: any = { ...data };
      if (data.arrivalDate !== undefined) updateData.arrivalDate = data.arrivalDate ? new Date(data.arrivalDate) : null;
      if (data.departureDate !== undefined) updateData.departureDate = data.departureDate ? new Date(data.departureDate) : null;
      if (data.arrivalTime !== undefined) updateData.arrivalTime = data.arrivalTime ? new Date(data.arrivalTime) : null;

      const updatedGuest = await prisma.guest.update({
        where: { id },
        data: updateData
      });
      res.json(updatedGuest);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update guest" });
    }
  });

  app.delete("/api/manager/guests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const guest = await prisma.guest.findUnique({
        where: { id },
        include: { property: true }
      });
      // @ts-ignore
      if (!guest || guest.property.ownerId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await prisma.guest.delete({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete guest" });
    }
  });

  // Public Guest Endpoint
  app.get("/api/guests/:token", async (req, res) => {
    try {
      const { token } = req.params;

      // 1. Try finding a registered guest by their unique token
      const guest = await prisma.guest.findUnique({
        where: { token },
        include: {
          property: {
            include: {
              amenities: true,
              categories: { include: { dishes: true } },
            }
          }
        }
      });

      if (guest) {
        // Update linkViewedAt
        await prisma.guest.update({
          where: { id: guest.id },
          data: { linkViewedAt: new Date() }
        });

        // Return personalized guest journey with full property data
        const safeGuest = {
          token: guest.token,
          name: guest.name,
          roomNumber: guest.roomNumber,
          language: guest.language,
          arrivalDate: guest.arrivalDate,
          departureDate: guest.departureDate,
          arrivalTime: guest.arrivalTime,
          preferences: guest.preferences,
          communication: guest.communication,
          status: guest.status,
          property: {
            ...guest.property,
            heroImage: guest.property.heroImage || guest.property.bannerUrl,
            bannerUrl: guest.property.bannerUrl || guest.property.heroImage
          }
        };

        return res.json(safeGuest);
      }

      // 2. No guest found — fall back to property slug lookup (public QR access)
      const property = await prisma.property.findFirst({
        where: { OR: [{ slug: token }, { previewToken: token }] },
        include: {
          amenities: true,
          categories: { include: { dishes: true } },
        }
      });

      if (property) {
        console.log(`[GuestAPI] Slug/token fallback hit: token="${token}" → property="${property.name}" (id=${property.id})`);

        // Track scan interaction
        await prisma.guestInteraction.create({
          data: {
            propertyId: property.id,
            section: "QR_SCAN",
            guestToken: token
          }
        }).catch(() => {}); // Non-blocking analytics

        const safeGuest = {
          token: 'public-guest',
          name: 'Guest',
          status: 'CHECKED_IN',
          property: {
            ...property,
            heroImage: property.heroImage || property.bannerUrl,
            bannerUrl: property.bannerUrl || property.heroImage
          }
        };

        return res.json(safeGuest);
      }

      // 3. Neither guest nor property found
      return res.status(404).json({ error: "Guest journey not found" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch guest journey" });
    }
  });


  
  async function generateUniqueOrgSlug(baseName: string): Promise<string> {
    let base = baseName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!base || base.length === 0) {
      base = "organization";
    }
    base = base.substring(0, 50).replace(/-$/, "");

    let uniqueSlug = base;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${base}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

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
      const membership = await prisma.organizationMembership.findFirst({
        where: { userId: req.session.userId as string }
      });
      if (!membership) {
        return res.status(403).json({ error: "User is not part of an organization" });
      }

      const property = await prisma.property.create({
        data: {
          name,
          slug,
          ownerId: req.session.userId as string,
          orgId: membership.orgId,
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
      logAuthLookup(req, currentProperty, 'PUT /api/manager/properties/:slug');
      if (!currentProperty || currentProperty.ownerId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden or property not found" });
      }

      const entitlement = resolveEntitlement(currentProperty.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      const updatePayload: any = { ...validatedData };
      if (validatedData.heroImage && !validatedData.bannerUrl) {
        updatePayload.bannerUrl = validatedData.heroImage;
      }
      if (validatedData.bannerUrl && !validatedData.heroImage) {
        updatePayload.heroImage = validatedData.bannerUrl;
      }

      // Use updateMany for atomic ownership checking (prevents IDOR)
      // @ts-ignore
      const result = await prisma.property.updateMany({
        where: {
          slug: req.params.slug,
          // @ts-ignore
          ownerId: req.session.userId
        },
        data: updatePayload
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
  app.put("/api/manager/properties/:slug/amenities", requireAuth, async (req, res) => {
    try {
      const property = await prisma.property.findFirst({
        where: { slug: req.params.slug, ownerId: req.session.userId },
        include: { subscription: true }
      });
      if (!property) return res.status(403).json({ error: "Unauthorized or property not found" });

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      const { amenities } = req.body;
      if (!Array.isArray(amenities)) {
        return res.status(400).json({ error: "Invalid payload: amenities must be an array" });
      }

      await prisma.$transaction(async (tx) => {
        await tx.amenity.deleteMany({ where: { propertyId: property.id } });
        if (amenities.length > 0) {
          await tx.amenity.createMany({
            data: amenities.map((a: any, i: number) => ({
              propertyId: property.id,
              name: a.name || "Unnamed Amenity",
              description: a.description || "",
              icon: a.icon || "🏊‍♂️",
              openTime: a.openTime || "",
              closeTime: a.closeTime || "",
              requiresReservation: !!a.requiresReservation,
              rules: a.rules || "",
              location: a.location || "",
              floor: a.floor || "",
              directions: a.directions || "",
              contact: a.contact || "",
              heroImage: a.imageUrl || a.heroImage || "",
              status: a.status || "ACTIVE",
              priority: i + 1
            }))
          });
        }
      });

      publicPropertyCache.delete(req.params.slug);
      res.json({ success: true, count: amenities.length });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to update amenities" });
    }
  });

  app.post("/api/manager/properties/:slug/amenities", requireAuth, async (req, res) => {
    try {
      const validatedData = AmenitySchema.parse(req.body);
      const property = await prisma.property.findFirst({
        // @ts-ignore
        where: { slug: req.params.slug, ownerId: req.session.userId },
        include: { subscription: true }
      });
      if (!property) return res.status(403).json({ error: "Unauthorized" });

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

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

      const dishCount = await prisma.dish.count({
        where: { category: { propertyId: property.id } }
      });
      if (dishCount >= entitlement.maxDishes) {
        return res.status(403).json({ error: `Dish limit reached (${entitlement.maxDishes}). Please upgrade your plan.` });
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

      const categoryCount = await prisma.menuCategory.count({
        where: { propertyId: property.id }
      });
      if (categoryCount >= entitlement.maxCategories) {
        return res.status(403).json({ error: `Category limit reached (${entitlement.maxCategories}). Please upgrade your plan.` });
      }

      const category = await prisma.menuCategory.create({
        data: { 
          name: validatedData.name, 
          propertyId: property.id,
          displayOrder: validatedData.displayOrder ?? 0
        }
      });

      publicPropertyCache.delete(req.params.slug);
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
        data: { 
          name: validatedData.name,
          displayOrder: validatedData.displayOrder ?? category.displayOrder
        }
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

  // ============================================================
  // DASHBOARD & ACTIVITY
  // ============================================================

  app.get("/api/manager/properties/:slug/activity", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      // @ts-ignore
      const { userId } = req.session;

      const property = await prisma.property.findFirst({
        where: { slug, ownerId: userId }
      });

      if (!property) {
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      // We need to return structured data for the dashboard.
      // Since tracking is not yet implemented, ActivityEvent will be empty.
      // We will safely query it anyway so it's ready for the future.
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      // Recent events (last 5)
      const recentActivity = await prisma.activityEvent.findMany({
        where: { propertyId: property.id },
        orderBy: { timestamp: "desc" },
        take: 5
      });

      // Yesterday's metrics
      const yesterdayScans = await prisma.activityEvent.count({
        where: { propertyId: property.id, timestamp: { gte: yesterday, lt: today }, action: 'VIEWED', resourceType: 'PROPERTY' }
      });
      const yesterdayMenuViews = await prisma.activityEvent.count({
        where: { propertyId: property.id, timestamp: { gte: yesterday, lt: today }, action: 'VIEWED', resourceType: 'MENU' }
      });
      const yesterdayAmenityViews = await prisma.activityEvent.count({
        where: { propertyId: property.id, timestamp: { gte: yesterday, lt: today }, action: 'VIEWED', resourceType: 'RECOMMENDATION' }
      });

      // Guest interactions (e.g. WhatsApp, Reception calls)
      const interactions = await prisma.activityEvent.findMany({
        where: { 
          propertyId: property.id,
          action: 'EXECUTED',
          resourceType: 'RECOMMENDATION'
        },
        orderBy: { timestamp: "desc" },
        take: 5
      });

      res.json({
        recent: recentActivity,
        yesterday: {
          scans: yesterdayScans,
          menuViews: yesterdayMenuViews,
          guestPageVisits: yesterdayScans, // Proxy for now
          amenityViews: yesterdayAmenityViews,
          houseRulesViews: 0
        },
        interactions: interactions
      });

    } catch (err: any) {
      console.error("[Activity] Error:", err);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // ============================================================
  // PUBLIC TRACKING
  // ============================================================

  app.post("/api/tracking/event", async (req, res) => {
    try {
      const { propertyId, action, resourceType, metadata } = req.body;
      if (!propertyId || !action || !resourceType) {
        return res.status(400).json({ error: "Missing tracking data" });
      }

      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) return res.status(404).json({ error: "Property not found" });

      await prisma.activityEvent.create({
        data: {
          organizationId: property.orgId,
          propertyId: property.id,
          action,
          resourceType,
          source: 'WEB',
          metadata: metadata || {}
        }
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Tracking] Error:", err);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // ============================================================
  // PUBLISH WORKFLOW
  // ============================================================

  // GET /api/manager/properties/:slug/snapshots
  // Returns all published snapshots in descending order
  app.get("/api/manager/properties/:slug/snapshots", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      // @ts-ignore
      const { userId } = req.session;

      const property = await prisma.property.findFirst({
        where: { slug, ownerId: userId }
      });

      if (!property) {
        console.log(`[Snapshots] 403 – property "${slug}" not found for user ${userId}`);
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      const snapshots = await prisma.propertySnapshot.findMany({
        where: { propertyId: property.id },
        orderBy: { publishedAt: "desc" }
      });

      console.log(`[Snapshots] slug=${slug} propertyId=${property.id} count=${snapshots.length}`);
      res.json(snapshots);
    } catch (err: any) {
      console.error("[Snapshots] Error:", err);
      res.status(500).json({ error: "Failed to fetch snapshots" });
    }
  });

  // POST /api/manager/properties/:slug/publish
  // Creates a snapshot of the current property state, marks property as published,
  // ensures previewToken exists, and returns the published property with QR URL.
  app.post("/api/manager/properties/:slug/publish", requireAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      // @ts-ignore
      const { userId } = req.session;

      console.log(`[Publish] BEGIN – slug=${slug} userId=${userId}`);

      // 1. Verify ownership
      const property = await prisma.property.findFirst({
        where: { slug, ownerId: userId },
        include: {
          amenities: true,
          categories: { include: { dishes: true } },
          subscription: true
        }
      });

      if (!property) {
        console.log(`[Publish] 403 – property "${slug}" not found for user ${userId}`);
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      console.log(`[Publish] Property found: id=${property.id} name="${property.name}"`);

      // 2. Check entitlement
      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canPublish) {
        console.log(`[Publish] 403 – canPublish=false plan=${entitlement.plan} status=${entitlement.subscriptionStatus}`);
        return res.status(403).json({ error: "Subscription expired. Upgrade to publish." });
      }

      // 3. Ensure previewToken exists (generate one if missing)
      let previewToken = property.previewToken;
      if (!previewToken) {
        previewToken = crypto.randomBytes(24).toString("hex");
        await prisma.property.update({
          where: { id: property.id },
          data: { previewToken }
        });
        console.log(`[Publish] Generated new previewToken: ${previewToken}`);
      } else {
        console.log(`[Publish] Existing previewToken: ${previewToken}`);
      }

      // 4. Build snapshot payload (full property state)
      const snapshotData = {
        property: {
          id: property.id,
          slug: property.slug,
          name: property.name,
          description: property.description,
          bannerUrl: property.bannerUrl || property.heroImage,
          heroImage: property.heroImage || property.bannerUrl,
          logoUrl: property.logoUrl,
          previewToken,
          propertyType: property.propertyType,
          tagline: property.tagline,
          welcomeMessage: property.welcomeMessage,
          wifiNetwork: property.wifiNetwork,
          wifiPassword: property.wifiPassword,
          hostInfo: property.hostInfo,
          houseRules: property.houseRules,
          hotelRules: property.hotelRules,
          contacts: property.contacts,
          experiences: property.experiences,
          receptionPhone: property.receptionPhone,
          housekeepingPhone: property.housekeepingPhone,
          emergencyPhone: property.emergencyPhone,
          roomServicePhone: property.roomServicePhone,
          checkInTime: property.checkInTime,
          checkOutTime: property.checkOutTime,

          conciergeServices: property.conciergeServices,
          galleryImages: property.galleryImages,
          gallery: property.gallery,
          highlights: property.highlights
        },
        amenities: property.amenities,
        categories: property.categories,
        dishes: property.categories.flatMap(c => c.dishes),
        publishedAt: new Date().toISOString()
      };

      // 5. Create snapshot record
      const snapshot = await prisma.propertySnapshot.create({
        data: {
          propertyId: property.id,
          data: snapshotData,
          publishedBy: userId
        }
      });

      console.log(`[Publish] Snapshot created: id=${snapshot.id} publishedAt=${snapshot.publishedAt}`);

      // 6. Invalidate the public property cache so guests see fresh data
      publicPropertyCache.delete(slug);

      // 7. Build QR URL
      const baseUrl = req.headers.origin || `https://${req.headers.host}`;
      const guestUrl = `${baseUrl}/g/${slug}`;
      const previewUrl = `${baseUrl}/preview/${previewToken}`;

      console.log(`[Publish] SUCCESS – guestUrl=${guestUrl} snapshotId=${snapshot.id}`);

      res.json({
        success: true,
        snapshotId: snapshot.id,
        publishedAt: snapshot.publishedAt,
        previewToken,
        guestUrl,
        previewUrl,
        propertyId: property.id,
        slug: property.slug
      });
    } catch (err: any) {
      console.error("[Publish] FATAL ERROR:", err);
      res.status(500).json({
        error: "Failed to publish property",
        detail: err?.message || "Unknown server error"
      });
    }
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
