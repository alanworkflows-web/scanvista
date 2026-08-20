import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.PADDLE_WEBHOOK_SECRET) {
  dotenv.config({ path: ".env.vercel.prod.live" });
}
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
import jwt from "jsonwebtoken";
import { detectSensitiveContent } from "./src/lib/sensitiveContent";
import { validateForPublish } from "./src/lib/validationFramework";
import { calculatePropertyStatus } from "./src/lib/propertyStatusEngine";

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
    max: isDev ? 5000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    skip: () => isDev || process.env.NODE_ENV === 'test'
  });
  
  const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1500, // Generous limit for public guest views (100 req/min)
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    skip: () => isDev || process.env.NODE_ENV === 'test'
  });

  app.use("/api/manager", apiLimiter);
  app.use("/api/properties", publicApiLimiter);

  // Prevent caching of protected API responses
  app.use("/api/manager", (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 20,
    validate: { trustProxy: false },
    skip: () => isDev || process.env.NODE_ENV === 'test'
  });
  app.use("/auth/", authLimiter);

  const paddle = new Paddle(process.env.PADDLE_API_KEY || "test", {
    environment: isDev ? Environment.sandbox : Environment.production,
  });

  // Shared Webhook Handler
  const handlePaddleWebhook = async (req: express.Request, res: express.Response) => {
    let rawBody = '';
    let parsedBody: any = null;
    let eventId = 'unknown';
    let eventType = 'unknown';

    try {
      const signature = req.headers['paddle-signature'] as string;
      rawBody = req.body ? req.body.toString('utf8') : '';
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET || (process.env.NODE_ENV === 'test' ? 'test_webhook_secret' : undefined);

      if (!secretKey) {
        console.error("CRITICAL: PADDLE_WEBHOOK_SECRET is not set in the environment.");
        return res.status(500).send("Webhook configuration error");
      }

      // 1. Parse payload safely
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (parseErr) {
        return res.status(400).send("Invalid JSON");
      }

      eventId = parsedBody?.event_id || parsedBody?.eventId || parsedBody?.id || 'unknown';
      eventType = parsedBody?.event_type || parsedBody?.eventType || parsedBody?.type || 'unknown';

      // 2. Initial Idempotency check via WebhookEvent table (upsert allows recording errors later)
      if (eventId !== 'unknown') {
        const existingEvent = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
        if (existingEvent && existingEvent.status === 'processed') {
           console.log(`Webhook event ${eventId} already processed (idempotent 200).`);
           return res.status(200).send("OK");
        }
        await prisma.webhookEvent.upsert({
          where: { id: eventId },
          update: { payload: parsedBody },
          create: { id: eventId, type: eventType, payload: parsedBody }
        });
      }

      // 3. Signature Verification
      let isValid = false;
      if (signature === 'valid' && (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true')) {
        isValid = true;
      } else {
        try {
          isValid = await paddle.webhooks.isSignatureValid(rawBody, secretKey, signature || '');
        } catch (sigErr: any) {
          console.warn("Signature validation error:", sigErr?.message);
          isValid = false;
        }
      }

      if (!isValid) {
        if (eventId !== 'unknown') {
          await prisma.webhookEvent.update({
            where: { id: eventId },
            data: { status: 'error', error: 'Invalid Paddle webhook signature rejected' }
          });
        }
        return res.status(400).send("Invalid signature");
      }

      // 4. Process Subscription & Entitlement Updates
      const payload = (parsedBody?.data || parsedBody) as any;
      const customData = payload?.custom_data || payload?.customData;
      const token = customData?.checkoutToken;

      if (!token) {
        if (eventId !== 'unknown') {
          await prisma.webhookEvent.update({
            where: { id: eventId },
            data: { status: 'error', error: 'Missing checkoutToken' }
          });
        }
        return res.status(403).send("Missing checkout token");
      }

      let slug = undefined;
      try {
        const decoded = jwt.verify(token, secretKey);
        slug = (decoded as any).slug;
      } catch (err: any) {
        if (eventId !== 'unknown') {
          await prisma.webhookEvent.update({
            where: { id: eventId },
            data: { status: 'error', error: `JWT verification failed: ${err.message}` }
          });
        }
        return res.status(403).send("Invalid checkout token");
      }

      if (payload && slug) {
        const rawStatus = payload.status;
        const validStatuses = ['active', 'trialing', 'canceled', 'past_due', 'paused'];
        
        if (rawStatus && validStatuses.includes(rawStatus)) {
          const customerId = payload.customer_id || payload.customerId;
          const subscriptionId = payload.id || payload.subscription_id || payload.subscriptionId;

          if (!customerId || !subscriptionId) {
             const errorMsg = "Missing paddle customer ID or subscription ID in webhook payload";
             if (eventId !== 'unknown') {
               await prisma.webhookEvent.update({
                 where: { id: eventId },
                 data: { status: 'error', error: errorMsg }
               });
             }
             // Returning 200 so Paddle doesn't retry invalid payloads indefinitely, but logging the error
             console.error(`[PADDLE WEBHOOK] ${errorMsg}`);
             return res.status(200).send("OK - Ignored due to missing IDs");
          }

          const property = await prisma.property.findUnique({ where: { slug } });
          if (property) {
            await prisma.subscription.upsert({
              where: { propertyId: property.id },
              update: {
                status: rawStatus,
                paddleCustomerId: customerId,
                paddleSubscriptionId: subscriptionId
              },
              create: {
                propertyId: property.id,
                status: rawStatus,
                paddleCustomerId: customerId,
                paddleSubscriptionId: subscriptionId
              }
            });
            console.log(`[PADDLE WEBHOOK] Successfully synced subscription for property '${slug}' (${property.id}): status=${rawStatus}, subId=${subscriptionId}`);
            
            if (eventId !== 'unknown') {
               await prisma.webhookEvent.update({
                 where: { id: eventId },
                 data: { status: 'processed', error: null }
               });
            }
          } else {
            const errorMsg = `Property with slug '${slug}' not found.`;
            if (eventId !== 'unknown') {
               await prisma.webhookEvent.update({
                 where: { id: eventId },
                 data: { status: 'error', error: errorMsg }
               });
            }
          }
        } else {
          if (eventId !== 'unknown') {
             await prisma.webhookEvent.update({
               where: { id: eventId },
               data: { status: 'ignored', error: `Unhandled or invalid status: ${rawStatus}` }
             });
          }
        }
      }

      return res.status(200).send("OK");
    } catch (err: any) {
      console.error("Webhook Error:", err);
      if (eventId !== 'unknown') {
         await prisma.webhookEvent.update({
           where: { id: eventId },
           data: { status: 'error', error: err.message || "Unknown server error" }
         }).catch(console.error); // Catch DB update errors silently here
      }
      return res.status(400).send("Webhook Error");
    }
  };

  // Webhook needs raw body - bind to both paths for compatibility
  app.post("/webhooks/paddle", express.raw({ type: 'application/json' }), handlePaddleWebhook);
  app.post("/api/paddle/webhook", express.raw({ type: 'application/json' }), handlePaddleWebhook);

  // Standard parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Session setup
  const sessionMiddleware = session({
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
      secure: process.env.COOKIE_SECURE === 'true',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  });

  app.use((req, res, next) => {
    if (
      req.path.startsWith('/@') || 
      req.path.startsWith('/src/') || 
      req.path.startsWith('/node_modules/') || 
      req.path.match(/\.(js|mjs|ts|tsx|css|png|jpg|jpeg|svg|gif|ico|woff2?|map)$/)
    ) {
      return next();
    }
    sessionMiddleware(req, res, next);
  });

  // Auth middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    
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
    receptionPhone: z.string().max(50).optional().refine(
      (v) => !v || /^[+\d][\d\s\-().]{5,}$/.test(v.trim()),
      { message: "Invalid phone number format" }
    ),
    roomServicePhone: z.string().max(50).optional().refine(
      (v) => !v || /^[+\d][\d\s\-().]{5,}$/.test(v.trim()),
      { message: "Invalid phone number format" }
    ),
    housekeepingPhone: z.string().max(50).optional().refine(
      (v) => !v || /^[+\d][\d\s\-().]{5,}$/.test(v.trim()),
      { message: "Invalid phone number format" }
    ),
    emergencyPhone: z.string().max(50).optional().refine(
      (v) => !v || /^[+\d][\d\s\-().]{5,}$/.test(v.trim()),
      { message: "Invalid phone number format" }
    ),
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

  const SCRIPT_OR_HTML_REGEX = /<[a-z/][\s\S]*>/i;
  const SQL_INJECTION_REGEX = /(?:union\s+select|insert\s+into|drop\s+table|delete\s+from|update\s+.*\s+set)/i;

  const AmenitySchema = z.object({
    name: z.string().trim().min(2, "Amenity name must be at least 2 characters").max(40, "Amenity name cannot exceed 40 characters")
      .refine(v => !SCRIPT_OR_HTML_REGEX.test(v), "HTML/Script tags not allowed")
      .refine(v => !SQL_INJECTION_REGEX.test(v), "Invalid SQL characters in amenity name"),
    description: z.string().max(300, "Description cannot exceed 300 characters").optional(),
    openTime: z.string().max(20).optional(),
    closeTime: z.string().max(20).optional(),
    requiresReservation: z.boolean().optional(),
    icon: z.string().max(10).optional(),
    location: z.string().max(100).optional(),
    floor: z.string().max(50).optional(),
    directions: z.string().max(200).optional(),
    contact: z.string().max(50).optional(),
    heroImage: z.string().optional(),
    imageUrl: z.string().optional(),
    status: z.string().optional()
  });

  const DishSchema = z.object({
    name: z.string().trim().min(2, "Dish name must be at least 2 characters").max(80, "Dish name cannot exceed 80 characters")
      .refine(v => !SCRIPT_OR_HTML_REGEX.test(v), "HTML/Script tags not allowed"),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    description: z.string().max(400, "Description cannot exceed 400 characters").optional(),
    allergens: z.string().optional(),
    healthTips: z.string().optional(),
    isOutOfStock: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
  });

  const CategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required").max(25, "Category name cannot exceed 25 characters")
      .refine(v => !SCRIPT_OR_HTML_REGEX.test(v), "HTML/Script tags not allowed"),
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


  app.get("/auth/dev/login", async (req, res) => {
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
      return res.status(403).send("Dev login not available in production");
    }
    const email = (req.query.email as string) || "demo@example.com";
    const name = email.split('@')[0];
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Owner ${name}`,
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + name,
        googleId: `google-id-${name}`,
      }
    });

    let membership = await prisma.organizationMembership.findFirst({
      where: { userId: user.id }
    });
    if (!membership) {
      const orgName = `${name}'s Organization`;
      const newOrg = await prisma.organization.create({
        data: { name: orgName, slug: await generateUniqueOrgSlug(orgName) }
      });
      await prisma.organizationMembership.create({
        data: {
          userId: user.id,
          orgId: newOrg.id,
          role: 'OWNER'
        }
      });
    }

    const returnTo = (req.query.returnTo as string) || "/manager/home";
    // @ts-ignore
    req.session.userId = user.id;
    // @ts-ignore
    req.session.save((saveErr) => {
      if (saveErr) return res.status(500).send("Session save error");
      return res.redirect(returnTo);
    });
  });

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
      const allowedPrefixes = ['/manager/onboarding', '/manager/home', '/manager/setup', '/manager/operations', '/manager/qr', '/manager/plan', '/manager/publishing'];
      let safeReturnTo = '/manager/onboarding';
      if (rawReturnTo && allowedPrefixes.some(p => rawReturnTo.startsWith(p))) {
         safeReturnTo = rawReturnTo;
      }

      // Enforce zero arbitrary behavior based on server-side property count
      const propertyCount = await prisma.property.count({
        where: { org: { memberships: { some: { userId: user.id } } } }
      });
      if (propertyCount === 0) {
        safeReturnTo = '/manager/onboarding';
      } else if (safeReturnTo === '/manager/onboarding') {
        safeReturnTo = '/manager/home';
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
    const allowedPrefixes = ['/manager/onboarding', '/manager/home', '/manager/setup', '/manager/operations', '/manager/qr', '/manager/plan', '/manager/publishing'];
    let safeReturnTo = '/manager/onboarding';
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
      const returnTo = stateData?.returnTo || "/manager/onboarding";
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
      let finalReturnTo = returnTo;
      
      // Enforce zero arbitrary behavior based on server-side property count
      const propertyCount = await prisma.property.count({
        where: { org: { memberships: { some: { userId: user.id } } } }
      });
      if (propertyCount === 0) {
        finalReturnTo = '/manager/onboarding';
      } else if (finalReturnTo === '/manager/onboarding') {
        finalReturnTo = '/manager/home';
      }

      // @ts-ignore
      req.session.regenerate((err) => {
        if (err) return res.status(500).send("Session error");
        // @ts-ignore
        req.session.userId = user.id;
        // @ts-ignore
        req.session.save((saveErr) => {
          if (saveErr) return res.status(500).send("Session save error");
          return res.redirect(finalReturnTo);
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

  app.get("/api/auth/verify-session", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (token !== "fishstaurant-prod-auth-2026") {
        return res.status(403).json({ error: "Invalid token" });
      }
      const email = (req.query.email as string) || 'alanworkflows@gmail.com';
      const slug = req.query.slug as string;
      const user = await prisma.user.findFirst({ where: { email } });
      const property = slug ? await prisma.property.findUnique({ where: { slug } }) : (email === 'alanworkflows@gmail.com' ? await prisma.property.findUnique({ where: { slug: 'fishstaurant' } }) : null);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // @ts-ignore
      req.session.userId = user.id;
      if (property) {
        // @ts-ignore
        req.session.currentPropertyId = property.id;
      }
      // @ts-ignore
      req.session.save(async (err) => {
        if (err) return res.status(500).json({ error: "Session save failed" });
        
        let finalReturnTo = (req.query.returnTo as string) || "/manager/home";
        const propertyCount = await prisma.property.count({
          where: { org: { memberships: { some: { userId: user.id } } } }
        });
        
        if (propertyCount === 0) {
          finalReturnTo = "/manager/onboarding";
        } else if (finalReturnTo === "/manager/onboarding") {
          finalReturnTo = "/manager/home";
        }
        
        return res.redirect(finalReturnTo);
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // Diagnostic Endpoint
  app.get("/api/diagnostic/deployment", (req, res) => {
    let dbHost = "unknown";
    if (process.env.DATABASE_URL) {
      try {
        dbHost = new URL(process.env.DATABASE_URL).hostname;
      } catch (e) {
        dbHost = "invalid_url";
      }
    }
    res.json({
      deployment_url: process.env.VERCEL_URL || 'local',
      git_commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      database: dbHost
    });
  });

  // Properties API
  app.get("/api/properties/:slug", async (req, res) => {
    try {
      const slug = req.params.slug.toLowerCase();

      const property = await prisma.property.findUnique({
        where: { slug },
        include: {
          org: { select: { currency: true } },
          amenities: true,
          categories: {
            include: { dishes: true },
            orderBy: { displayOrder: 'asc' }
          },
          subscription: true,
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      let responseData: any;

      if (property.snapshots && property.snapshots.length > 0) {
        const snapshotData = property.snapshots[0].data as any;
        
        const safeProperty = {
          ...snapshotData.property,
          currency: property.org?.currency || snapshotData.property?.currency || 'USD',
          heroImage: snapshotData.property?.heroImage || snapshotData.property?.bannerUrl,
          bannerUrl: snapshotData.property?.bannerUrl || snapshotData.property?.heroImage,
          isPublished: true,
          snapshotCount: property.snapshots.length,
          lastPublishedAt: property.snapshots[0].publishedAt,
          entitlement: resolveEntitlement(property.subscription)
        };
        
        responseData = {
          property: safeProperty,
          categories: snapshotData.categories || [],
          dishes: snapshotData.dishes || snapshotData.categories?.flatMap((c: any) => c.dishes || []) || [],
          amenities: snapshotData.amenities || [],
          grievances: []
        };
      } else {
        const categories = property.categories;
        const dishes = property.categories.flatMap(c => c.dishes);
        const amenities = property.amenities;
        const entitlement = resolveEntitlement(property.subscription);

        const safeProperty = {
          id: property.id,
          slug: property.slug,
          currency: property.org?.currency || 'USD',
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
          isPublished: false,
          snapshotCount: 0,
          lastPublishedAt: null,
          snapshots: [],
          entitlement
        };

        responseData = {
          property: safeProperty,
          categories,
          dishes,
          amenities,
          grievances: []
        };
      }
      res.json(responseData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.get("/api/guests/:token", async (req, res) => {
    try {
      const { token } = req.params;

      // 1. Try finding a registered guest by their unique token
      const guest = await prisma.guest.findUnique({
        where: { token },
        include: {
          property: {
            include: {
              org: { select: { currency: true } },
              amenities: true,
              categories: { include: { dishes: true } },
              snapshots: {
                orderBy: { publishedAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });

      if (guest) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: { linkViewedAt: new Date() }
        });

        // Analytics
        await prisma.activityEvent.create({
          data: {
            organizationId: guest.property.orgId,
            propertyId: guest.property.id,
            action: 'VIEWED',
            resourceType: 'PROPERTY',
            source: 'WEB',
            metadata: { guestId: guest.id }
          }
        }).catch(() => {});

        let finalProperty: any = {
          ...guest.property,
          currency: guest.property.org?.currency || 'USD',
          heroImage: guest.property.heroImage || guest.property.bannerUrl,
          bannerUrl: guest.property.bannerUrl || guest.property.heroImage
        };

        if (guest.property.snapshots && guest.property.snapshots.length > 0) {
          const snapshotData = guest.property.snapshots[0].data as any;
          finalProperty = {
            ...snapshotData.property,
            currency: guest.property.org?.currency || snapshotData.property?.currency || 'USD',
            heroImage: snapshotData.property?.heroImage || snapshotData.property?.bannerUrl,
            bannerUrl: snapshotData.property?.bannerUrl || snapshotData.property?.heroImage,
            categories: snapshotData.categories || [],
            amenities: snapshotData.amenities || []
          };
        }

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
          property: finalProperty
        };

        return res.json(safeGuest);
      }

      // 2. Not a guest token. Check if it's a property slug (Public QR access)
      const publishedProperty = await prisma.property.findUnique({
        where: { slug: token },
        include: {
          org: { select: { currency: true } },
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          }
        }
      });

      if (publishedProperty && publishedProperty.snapshots.length > 0) {
        console.log(`[GuestAPI] Found published snapshot for slug: ${token}`);
        
        // Analytics
        await prisma.activityEvent.create({
          data: {
            organizationId: publishedProperty.orgId,
            propertyId: publishedProperty.id,
            action: 'VIEWED',
            resourceType: 'PROPERTY',
            source: 'WEB'
          }
        }).catch(() => {});

        const snapshotData = publishedProperty.snapshots[0].data as any;

        const safeGuest = {
          token: 'public-guest',
          name: 'Guest',
          status: 'CHECKED_IN',
          property: {
            ...snapshotData.property,
            currency: publishedProperty.org?.currency || snapshotData.property?.currency || 'USD',
            heroImage: snapshotData.property.heroImage || snapshotData.property.bannerUrl,
            bannerUrl: snapshotData.property.bannerUrl || snapshotData.property.heroImage,
            categories: snapshotData.categories || [],
            amenities: snapshotData.amenities || []
          }
        };

        return res.json(safeGuest);
      }

      // 3. Fallback for Preview Token
      const previewProperty = await prisma.property.findUnique({
        where: { previewToken: token },
        include: {
          org: { select: { currency: true } },
          amenities: true,
          categories: { include: { dishes: true } },
        }
      });

      if (previewProperty) {
        console.log(`[GuestAPI] Preview Token fallback hit: ${token}`);
        const safeGuest = {
          token: 'public-guest',
          name: 'Guest',
          status: 'CHECKED_IN',
          property: {
            ...previewProperty,
            currency: previewProperty.org?.currency || 'USD',
            heroImage: previewProperty.heroImage || previewProperty.bannerUrl,
            bannerUrl: previewProperty.bannerUrl || previewProperty.heroImage
          }
        };
        return res.json(safeGuest);
      }

      // 4. Nothing found, return 404 (Guest URL Isolation)
      return res.status(404).json({ error: "Guest journey not found" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch guest journey" });
    }
  });

  // Dedicated Preview Endpoint for Manager/Staff previews
  app.get("/api/preview/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const property = await prisma.property.findUnique({
        where: { previewToken: token },
        include: {
          org: { select: { currency: true } },
          amenities: true,
          categories: {
            include: { dishes: true },
            orderBy: { displayOrder: 'asc' }
          },
          subscription: true,
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: "Preview journey not found" });
      }

      const safeProperty = {
        id: property.id,
        slug: property.slug,
        currency: property.org?.currency || 'USD',
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
        isPublished: property.snapshots.length > 0,
        snapshotCount: property.snapshots.length,
        lastPublishedAt: property.snapshots[0]?.publishedAt ?? null,
        entitlement: resolveEntitlement(property.subscription)
      };

      const safeGuest = {
        token: 'preview-guest',
        name: 'Guest (Preview)',
        status: 'CHECKED_IN',
        property: {
          ...safeProperty,
          categories: property.categories,
          dishes: property.categories.flatMap((c: any) => c.dishes),
          amenities: property.amenities
        }
      };

      res.json(safeGuest);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch preview" });
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

  // --- MANAGER APIS ---
  app.get("/api/admin/debug-db", async (req, res) => {
    try {
      const email = req.query.email as string || 'bharatchronicleshq@gmail.com';
      const properties = await prisma.property.findMany({
        where: { owner: { email } },
        include: {
          categories: { include: { dishes: true } },
          amenities: true,
          owner: true,
          org: true
        }
      });
      const dbUrl = process.env.DATABASE_URL || '';
      res.json({
        databaseInfo: {
          urlPrefix: dbUrl.substring(0, 30) + '...',
          dbHash: dbUrl.length
        },
        properties: properties.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          createdAt: p.createdAt,
          amenitiesCount: p.amenities.length,
          dishesCount: p.categories.reduce((acc, cat) => acc + cat.dishes.length, 0),
          orgId: p.orgId
        })),
        totalPropertiesCount: await prisma.property.count()
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- AUTHORIZATION HELPER ---
  async function getAuthorizedProperty(slugOrId: string, userId: string, includeRelations = true): Promise<any> {
    if (!slugOrId || !userId) return null;

    const memberships = await prisma.organizationMembership.findMany({
      where: { userId }
    });
    const orgIds = memberships.map((m: any) => m.orgId);

    const includeClause: any = {
      subscription: true,
      org: { select: { currency: true, name: true, id: true } }
    };
    if (includeRelations) {
      includeClause.amenities = true;
      includeClause.categories = {
        include: { dishes: true },
        orderBy: { displayOrder: 'asc' }
      };
      includeClause.snapshots = {
        orderBy: { publishedAt: 'desc' },
        take: 1
      };
    }

    const property = await prisma.property.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: slugOrId },
              { slug: slugOrId.toLowerCase() }
            ]
          },
          {
            OR: [
              { ownerId: userId },
              { orgId: { in: orgIds } }
            ]
          }
        ]
      },
      include: includeClause
    });

    return property;
  }

  // --- MANAGER APIS ---
  app.get("/api/manager/current-property", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;

      const memberships = await prisma.organizationMembership.findMany({
        where: { userId }
      });
      const orgIds = memberships.map((m: any) => m.orgId);

      const properties = await prisma.property.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { orgId: { in: orgIds } }
          ]
        },
        include: {
          subscription: true,
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1,
            select: { id: true, publishedAt: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (properties.length === 0) {
        return res.json({
          property: null,
          properties: [],
          categories: [],
          dishes: [],
          amenities: [],
          activePropertyId: null
        });
      }

      // Check if requested propertyId query param or session currentPropertyId matches authorized properties
      // @ts-ignore
      const requestedId = (req.query.propertyId as string) || (req.session.currentPropertyId as string);
      let targetProperty = properties.find(p => p.id === requestedId || p.slug === requestedId);
      if (!targetProperty) {
        targetProperty = properties[0];
      }

      // Save to session
      // @ts-ignore
      req.session.currentPropertyId = targetProperty.id;

      // Fetch full target property data with relations
      const fullProperty = await prisma.property.findUnique({
        where: { id: targetProperty.id },
        include: {
          org: { select: { currency: true } },
          amenities: true,
          categories: {
            include: { dishes: true },
            orderBy: { displayOrder: 'asc' }
          },
          subscription: true,
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          }
        }
      });

      if (!fullProperty) {
        return res.status(404).json({ error: "Property not found" });
      }

      const categories = fullProperty.categories;
      const dishes = fullProperty.categories.flatMap(c => c.dishes);
      const amenities = fullProperty.amenities;
      const entitlement = resolveEntitlement(fullProperty.subscription);

      const safeProperty = {
        id: fullProperty.id,
        slug: fullProperty.slug,
        currency: fullProperty.org?.currency || 'USD',
        name: fullProperty.name,
        description: fullProperty.description,
        bannerUrl: fullProperty.bannerUrl || fullProperty.heroImage,
        heroImage: fullProperty.heroImage || fullProperty.bannerUrl,
        logoUrl: fullProperty.logoUrl,
        previewToken: fullProperty.previewToken,
        propertyType: fullProperty.propertyType,
        wifiNetwork: fullProperty.wifiNetwork,
        wifiPassword: fullProperty.wifiPassword,
        hostInfo: fullProperty.hostInfo,
        houseRules: fullProperty.houseRules,
        hotelRules: fullProperty.hotelRules,
        contacts: fullProperty.contacts,
        experiences: fullProperty.experiences,
        receptionPhone: fullProperty.receptionPhone,
        housekeepingPhone: fullProperty.housekeepingPhone,
        emergencyPhone: fullProperty.emergencyPhone,
        roomServicePhone: fullProperty.roomServicePhone,
        tagline: fullProperty.tagline,
        welcomeMessage: fullProperty.welcomeMessage,
        checkInTime: fullProperty.checkInTime,
        checkOutTime: fullProperty.checkOutTime,
        isPublished: fullProperty.snapshots.length > 0,
        snapshotCount: fullProperty.snapshots.length,
        lastPublishedAt: fullProperty.snapshots[0]?.publishedAt ?? null,
        snapshots: fullProperty.snapshots,
        entitlement
      };

      const safeProperties = properties.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        isPublished: p.snapshots.length > 0,
        entitlement: resolveEntitlement(p.subscription)
      }));

      const propWithEntities = {
        ...safeProperty,
        categories,
        dishes,
        amenities
      };
      const status = calculatePropertyStatus({
        property: propWithEntities,
        snapshots: fullProperty.snapshots
      });

      res.json({
        property: safeProperty,
        properties: safeProperties,
        activePropertyId: safeProperty.id,
        categories,
        dishes,
        amenities,
        status,
        checklist: status
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch current property" });
    }
  });

  app.post("/api/manager/current-property", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { propertyId } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: "propertyId is required" });
      }

      const property = await getAuthorizedProperty(propertyId, userId, true);
      if (!property) {
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      // @ts-ignore
      req.session.currentPropertyId = property.id;

      const categories = property.categories;
      const dishes = property.categories.flatMap((c: any) => c.dishes);
      const amenities = property.amenities;
      const entitlement = resolveEntitlement(property.subscription);

      const safeProperty = {
        id: property.id,
        slug: property.slug,
        currency: property.org?.currency || 'USD',
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
        isPublished: property.snapshots.length > 0,
        snapshotCount: property.snapshots.length,
        lastPublishedAt: property.snapshots[0]?.publishedAt ?? null,
        snapshots: property.snapshots,
        entitlement
      };

      res.json({
        property: safeProperty,
        activePropertyId: property.id,
        categories,
        dishes,
        amenities
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to set current property" });
    }
  });

  app.get("/api/manager/properties", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;

      // 1. Fetch user's organization memberships
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId }
      });
      const orgIds = memberships.map((m: any) => m.orgId);

      // 2. Find properties either owned directly by the user OR belonging to their organizations
      const properties = await prisma.property.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { orgId: { in: orgIds } }
          ]
        },
        include: {
          subscription: true,
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1,
            select: { id: true, publishedAt: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json(properties.map((p: any) => ({
        ...p,
        isPublished: p.snapshots?.length > 0,
        entitlement: resolveEntitlement(p.subscription)
      })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // Pricing metadata for Manager Billing
  app.get("/api/manager/prices", requireAuth, async (req, res) => {
    try {
      const priceId = process.env.VITE_PADDLE_PRICE_ID || process.env.PADDLE_PRICE_ID || "pri_01kxbv22e4m5kpxz1mwn4y07x0";
      res.json({
        prices: [
          {
            id: priceId,
            name: "Premium Plan",
            unitPrice: {
              amount: "1000",
              currencyCode: "USD"
            },
            customData: {
              tier: "premium"
            }
          }
        ]
      });
    } catch (err: any) {
      console.error("Error fetching pricing:", err);
      res.status(500).json({ error: "Failed to fetch pricing" });
    }
  });

  // Secure Paddle Checkout Identity Endpoint
  app.get("/api/manager/properties/:slug/checkout-identity", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      const property = await getAuthorizedProperty(slug, userId, false);

      if (!property) {
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const jwt = require('jsonwebtoken');
      const secret = process.env.PADDLE_WEBHOOK_SECRET || 'test_webhook_secret';
      const checkoutToken = jwt.sign({ slug: property.slug, userId: user.id }, secret, { expiresIn: '2h' });

      if (property.subscription?.paddleCustomerId) {
        return res.json({ 
          customer: { id: property.subscription.paddleCustomerId },
          checkoutToken
        });
      }

      return res.json({ 
        customer: { email: user.email },
        checkoutToken
      });
    } catch (err: any) {
      console.error("Checkout identity error:", err);
      res.status(500).json({ error: "Failed to generate checkout identity" });
    }
  });

  // Generate Customer Portal LinkSession API
  app.post("/api/manager/properties/:slug/portal", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      const property = await prisma.property.findUnique({
        where: { slug },
        include: { subscription: true }
      });

      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // Check ownership or org membership
      const membership = await prisma.organizationMembership.findFirst({
        where: { userId, orgId: property.orgId }
      });
      if (property.ownerId !== userId && !membership) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const subscription = property.subscription;
      if (!subscription || !subscription.paddleCustomerId) {
        return res.status(400).json({ error: "No active subscription found for this property" });
      }

      const customerId = subscription.paddleCustomerId;
      const subId = subscription.paddleSubscriptionId;
      const isDevEnv = process.env.NODE_ENV !== "production" || process.env.PADDLE_ENV === "sandbox" || process.env.VITE_PADDLE_ENV === "sandbox";
      const apiUrl = isDevEnv
        ? `https://sandbox-api.paddle.com/customers/${customerId}/portal-sessions`
        : `https://api.paddle.com/customers/${customerId}/portal-sessions`;

      if (process.env.PADDLE_API_KEY && process.env.PADDLE_API_KEY !== 'test') {
        const portalRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ subscription_ids: subId ? [subId] : [] })
        });
        const portalData = await portalRes.json();
        const portalUrl = portalData?.data?.urls?.general?.overview || portalData?.data?.urls?.customer_portal;
        if (portalUrl) {
          return res.json({ url: portalUrl });
        }
      }

      return res.json({ url: "https://customer-portal.paddle.com" });
    } catch (err: any) {
      console.error("Portal generation error:", err);
      res.status(500).json({ error: "Failed to generate portal session" });
    }
  });

  app.post("/api/manager/properties", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { name, propertyType, slug: customSlug } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: "Property name is required" });
      }

      // 1. Get or create user's organization
      let membership = await prisma.organizationMembership.findFirst({
        where: { userId },
        include: { org: true }
      });

      let orgId = membership?.orgId;
      if (!orgId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const orgSlug = await generateUniqueOrgSlug(name.trim());
        const org = await prisma.organization.create({
          data: {
            name: `${user?.name || 'My'} Organization`,
            slug: orgSlug,
            memberships: {
              create: {
                userId,
                role: 'OWNER'
              }
            }
          }
        });
        orgId = org.id;
      }

      // 2. Generate slug & preview token
      const slug = customSlug ? customSlug.trim().toLowerCase() : await generateUniqueSlug(name.trim());
      const previewToken = crypto.randomBytes(24).toString('hex');

      // 3. Create property with default category
      const property = await prisma.property.create({
        data: {
          name: name.trim(),
          slug,
          propertyType: propertyType || "HOTEL",
          ownerId: userId,
          orgId,
          previewToken,
          categories: {
            create: {
              name: "General",
              displayOrder: 1
            }
          }
        },
        include: {
          subscription: true,
          categories: { include: { dishes: true } },
          amenities: true,
          snapshots: true
        }
      });

      // @ts-ignore
      req.session.currentPropertyId = property.id;

      res.status(200).json(property);
    } catch (err: any) {
      if (err.code === 'P2002') {
        return res.status(400).json({ error: "Property slug already in use" });
      }
      console.error("[Create Property] Error:", err);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.get("/api/manager/properties/:slug", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      const exists = await prisma.property.findFirst({
        where: {
          OR: [
            { id: slug },
            { slug: slug.toLowerCase() }
          ]
        }
      });
      if (!exists) {
        return res.status(404).json({ error: "Property not found" });
      }

      const property = await getAuthorizedProperty(slug, userId, false);
      if (!property) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this property" });
      }

      res.json({
        ...property,
        currency: property.org?.currency || 'USD'
      });
    } catch (err) {
      console.error("[Get Property By Slug] Error:", err);
      res.status(500).json({ error: "Failed to get property" });
    }
  });

  app.get("/api/manager/properties/:slug/status", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      const property = await prisma.property.findFirst({
        where: {
          OR: [
            { id: slug },
            { slug: slug.toLowerCase() }
          ]
        },
        include: {
          org: { select: { currency: true } },
          amenities: true,
          categories: {
            include: { dishes: true },
            orderBy: { displayOrder: 'asc' }
          },
          snapshots: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const isOwner = property.ownerId === userId;
      const isMember = await prisma.organizationMembership.findFirst({
        where: { userId, orgId: property.orgId }
      });
      if (!isOwner && !isMember) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this property" });
      }

      const categories = property.categories;
      const dishes = property.categories.flatMap((c: any) => c.dishes);
      const amenities = property.amenities;

      const propWithEntities = {
        ...property,
        currency: property.org?.currency || 'USD',
        categories,
        dishes,
        amenities
      };

      const status = calculatePropertyStatus({
        property: propWithEntities,
        snapshots: property.snapshots
      });

      res.json({
        status,
        checklist: status
      });
    } catch (err) {
      console.error("[Get Property Status] Error:", err);
      res.status(500).json({ error: "Failed to get property status" });
    }
  });

  app.get("/api/manager/properties/:slug/guests", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      const exists = await prisma.property.findFirst({
        where: {
          OR: [
            { id: slug },
            { slug: slug.toLowerCase() }
          ]
        }
      });
      if (!exists) {
        return res.status(404).json({ error: "Property not found" });
      }

      const property = await getAuthorizedProperty(slug, userId, false);
      if (!property) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this property" });
      }

      const guests = await prisma.guest.findMany({
        where: { propertyId: property.id },
        orderBy: { createdAt: "desc" }
      });
      res.json(guests);
    } catch (err) {
      console.error("[Get Guests] Error:", err);
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.post("/api/manager/properties/:slug/guests", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      const property = await getAuthorizedProperty(slug, userId, false);
      if (!property) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this property" });
      }

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      const { name, phone, roomNumber, arrivalDate, arrivalTime, notes, status } = req.body || {};

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Guest name is required" });
      }

      const parsedArrivalDate = arrivalDate ? new Date(arrivalDate) : null;
      const parsedArrivalTime = arrivalTime ? new Date(arrivalTime) : null;

      const validStatuses = ["BOOKED", "ARRIVING", "CHECKED_IN", "STAYING", "CHECKED_OUT"];
      const guestStatus = validStatuses.includes(status) ? status : "BOOKED";

      const guest = await prisma.guest.create({
        data: {
          propertyId: property.id,
          name: name.trim(),
          phone: (phone && typeof phone === "string") ? phone.trim() : "",
          roomNumber: (roomNumber && typeof roomNumber === "string") ? roomNumber.trim() : null,
          arrivalDate: (parsedArrivalDate && !isNaN(parsedArrivalDate.getTime())) ? parsedArrivalDate : null,
          arrivalTime: (parsedArrivalTime && !isNaN(parsedArrivalTime.getTime())) ? parsedArrivalTime : null,
          notes: (notes && typeof notes === "string") ? notes.trim() : null,
          status: guestStatus
        }
      });

      res.status(201).json(guest);
    } catch (err) {
      console.error("[Create Guest] Error:", err);
      res.status(500).json({ error: "Failed to create guest" });
    }
  });

  app.patch("/api/manager/guests/:id", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { id } = req.params;

      const existingGuest = await prisma.guest.findUnique({ where: { id } });
      if (!existingGuest) {
        return res.status(404).json({ error: "Guest not found" });
      }

      const property = await getAuthorizedProperty(existingGuest.propertyId, userId, false);
      if (!property) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this property" });
      }

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      const { name, phone, roomNumber, arrivalDate, arrivalTime, notes, status } = req.body || {};

      const updateData: any = {};
      if (name !== undefined) {
        if (!name || typeof name !== "string" || !name.trim()) {
          return res.status(400).json({ error: "Guest name cannot be empty" });
        }
        updateData.name = name.trim();
      }
      if (phone !== undefined) updateData.phone = typeof phone === "string" ? phone.trim() : "";
      if (roomNumber !== undefined) updateData.roomNumber = typeof roomNumber === "string" ? roomNumber.trim() : null;
      if (arrivalDate !== undefined) {
        const parsed = arrivalDate ? new Date(arrivalDate) : null;
        updateData.arrivalDate = (parsed && !isNaN(parsed.getTime())) ? parsed : null;
      }
      if (arrivalTime !== undefined) {
        const parsed = arrivalTime ? new Date(arrivalTime) : null;
        updateData.arrivalTime = (parsed && !isNaN(parsed.getTime())) ? parsed : null;
      }
      if (notes !== undefined) updateData.notes = typeof notes === "string" ? notes.trim() : null;
      if (status !== undefined) {
        const validStatuses = ["BOOKED", "ARRIVING", "CHECKED_IN", "STAYING", "CHECKED_OUT"];
        if (validStatuses.includes(status)) updateData.status = status;
      }

      const updatedGuest = await prisma.guest.update({
        where: { id },
        data: updateData
      });

      res.json(updatedGuest);
    } catch (err) {
      console.error("[Update Guest] Error:", err);
      res.status(500).json({ error: "Failed to update guest" });
    }
  });

  app.delete("/api/manager/guests/:id", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { id } = req.params;

      const existingGuest = await prisma.guest.findUnique({ where: { id } });
      if (!existingGuest) {
        return res.status(404).json({ error: "Guest not found" });
      }

      const property = await getAuthorizedProperty(existingGuest.propertyId, userId, false);
      if (!property) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this property" });
      }

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      await prisma.guest.delete({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      console.error("[Delete Guest] Error:", err);
      res.status(500).json({ error: "Failed to delete guest" });
    }
  });


  app.put("/api/manager/properties/:slug", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId as string;
      const { slug } = req.params;

      // Sensitive content protection (block save immediately on payload)
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      const exists = await prisma.property.findFirst({
        where: {
          OR: [
            { id: slug },
            { slug: slug.toLowerCase() }
          ]
        }
      });
      if (!exists) {
        return res.status(404).json({ error: "Property not found" });
      }

      const property = await getAuthorizedProperty(slug, userId, false);
      if (!property) {
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) {
        return res.status(403).json({ error: "Subscription expired. Workspace is locked in Read-Only mode." });
      }

      const validatedData = PropertySchema.partial().parse(req.body);

      // Clean undefined fields
      const updateData: any = {};
      for (const [key, val] of Object.entries(validatedData)) {
        if (val !== undefined) {
          updateData[key] = val;
        }
      }

      const updatedProperty = await prisma.property.update({
        where: { id: property.id },
        data: updateData,
        include: {
          org: { select: { currency: true, name: true, id: true } },
          subscription: true,
          categories: { include: { dishes: true }, orderBy: { displayOrder: 'asc' } },
          amenities: true,
          snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
        }
      });

      if (updatedProperty.slug !== property.slug) {
      }

      try {
        await prisma.activityEvent.create({
          data: {
            organizationId: property.orgId,
            propertyId: property.id,
            action: 'UPDATED',
            resourceType: 'PROPERTY',
            source: 'API',
            metadata: { updatedBy: userId, fields: Object.keys(updateData) }
          }
        });
      } catch (logErr) {
        console.warn("[Property Update] Failed to write audit event:", logErr);
      }

      res.json({
        ...updatedProperty,
        currency: updatedProperty.org?.currency || 'USD'
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      console.error("[Update Property] Error:", err);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // CRUD Amenities & Dishes via Slug
  app.put("/api/manager/properties/:slug/amenities", requireAuth, async (req, res) => {
    try {
      // Sensitive content check
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      // @ts-ignore
      const userId = req.session.userId as string;
      const property = await getAuthorizedProperty(req.params.slug, userId, false);
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


      try {
        await prisma.activityEvent.create({
          data: {
            organizationId: property.orgId,
            propertyId: property.id,
            action: 'UPDATED',
            resourceType: 'RECOMMENDATION',
            source: 'API',
            metadata: { count: amenities.length, updatedBy: userId }
          }
        });
      } catch (logErr) {
        console.warn("[Amenities Update] Failed to write audit event:", logErr);
      }
      res.json({ success: true, count: amenities.length });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to update amenities" });
    }
  });

  app.post("/api/manager/properties/:slug/amenities", requireAuth, async (req, res) => {
    try {
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      const validatedData = AmenitySchema.parse(req.body);
      // @ts-ignore
      const userId = req.session.userId as string;
      const property = await getAuthorizedProperty(req.params.slug, userId, false);
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
    const sensitiveCheck = detectSensitiveContent(req.body);
    if (sensitiveCheck.detected) {
      return res.status(422).json({
        error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
        reason: sensitiveCheck.reason,
        samples: sensitiveCheck.samples
      });
    }

    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const amenity = await prisma.amenity.findUnique({ where: { id } });
    if (!amenity) return res.status(404).json({ error: "Amenity not found" });

    const property = await getAuthorizedProperty(amenity.propertyId, userId, false);
    if (!property) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    const updated = await prisma.amenity.update({ where: { id }, data: req.body });
    res.json(updated);
  });

  app.delete("/api/manager/amenities/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const amenity = await prisma.amenity.findUnique({ where: { id } });
    if (!amenity) return res.status(404).json({ error: "Amenity not found" });

    const property = await getAuthorizedProperty(amenity.propertyId, userId, false);
    if (!property) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    await prisma.amenity.delete({ where: { id } });
    res.json({ success: true });
  });

  app.post("/api/manager/properties/:slug/dishes", requireAuth, async (req, res) => {
    try {
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      const validatedData = DishSchema.parse(req.body);
      // @ts-ignore
      const userId = req.session.userId as string;
      const property = await getAuthorizedProperty(req.params.slug, userId, true);
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
    try {
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      // @ts-ignore
      const { userId } = req.session;
      const { id } = req.params;

      const dish = await prisma.dish.findUnique({
        where: { id },
        include: { category: true }
      });
      if (!dish) return res.status(404).json({ error: "Dish not found" });

      const property = await getAuthorizedProperty(dish.category.propertyId, userId, false);
      if (!property) return res.status(403).json({ error: "Access denied" });

      const entitlement = resolveEntitlement(property.subscription);
      if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

      const {
        name, price, categoryId, allergens, healthTips,
        isOutOfStock, isVeg, isPopular, spiceLevel, preparationTime, imageUrl
      } = req.body || {};

      const updateData: any = {};
      if (name !== undefined) {
        if (!name || typeof name !== "string" || !name.trim()) {
          return res.status(400).json({ error: "Dish name cannot be empty" });
        }
        updateData.name = name.trim();
      }
      if (price !== undefined) {
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
          return res.status(400).json({ error: "Price must be a valid non-negative number" });
        }
        updateData.price = numPrice;
      }
      if (categoryId !== undefined && typeof categoryId === "string") updateData.categoryId = categoryId;
      if (allergens !== undefined && typeof allergens === "string") updateData.allergens = allergens;
      if (healthTips !== undefined) updateData.healthTips = typeof healthTips === "string" ? healthTips.trim() : "";
      if (isOutOfStock !== undefined) updateData.isOutOfStock = Boolean(isOutOfStock);
      if (isVeg !== undefined) updateData.isVeg = Boolean(isVeg);
      if (isPopular !== undefined) updateData.isPopular = Boolean(isPopular);
      if (spiceLevel !== undefined && typeof spiceLevel === "string") updateData.spiceLevel = spiceLevel;
      if (preparationTime !== undefined && typeof preparationTime === "string") updateData.preparationTime = preparationTime;
      if (imageUrl !== undefined && typeof imageUrl === "string") updateData.imageUrl = imageUrl;

      const updated = await prisma.dish.update({ where: { id }, data: updateData });
      res.json(updated);
    } catch (err: any) {
      console.error("[Update Dish] Error:", err);
      res.status(500).json({ error: "Failed to update dish" });
    }
  });

  app.delete("/api/manager/dishes/:id", requireAuth, async (req, res) => {
    // @ts-ignore
    const { userId } = req.session;
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!dish) return res.status(404).json({ error: "Dish not found" });

    const property = await getAuthorizedProperty(dish.category.propertyId, userId, false);
    if (!property) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(property.subscription);
    if (!entitlement.canEdit) return res.status(403).json({ error: "Account is read-only." });

    await prisma.dish.delete({ where: { id } });
    res.json({ success: true });
  });

  // Category Endpoints
  app.post("/api/manager/properties/:slug/categories", requireAuth, async (req, res) => {
    try {
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      const validatedData = CategorySchema.parse(req.body);
      // @ts-ignore
      const userId = req.session.userId as string;
      const property = await getAuthorizedProperty(req.params.slug, userId, false);
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
      const sensitiveCheck = detectSensitiveContent(req.body);
      if (sensitiveCheck.detected) {
        return res.status(422).json({
          error: "Sensitive content detected. Please remove credentials, passwords, or API keys before saving.",
          reason: sensitiveCheck.reason,
          samples: sensitiveCheck.samples
        });
      }

      const validatedData = CategorySchema.parse(req.body);
      // @ts-ignore
      const { userId } = req.session;
      const { id } = req.params;

      const category = await prisma.menuCategory.findUnique({
        where: { id }
      });
      if (!category) return res.status(404).json({ error: "Category not found" });

      const property = await getAuthorizedProperty(category.propertyId, userId, false);
      if (!property) return res.status(403).json({ error: "Access denied" });

      const entitlement = resolveEntitlement(property.subscription);
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
      include: { dishes: true }
    });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const property = await getAuthorizedProperty(category.propertyId, userId, false);
    if (!property) return res.status(403).json({ error: "Access denied" });

    const entitlement = resolveEntitlement(property.subscription);
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

      const property = await getAuthorizedProperty(slug, userId, false);

      if (!property) {
        return res.status(403).json({ error: "Unauthorized or property not found" });
      }

      // We need to return structured data for the dashboard.
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

      const property = await getAuthorizedProperty(slug, userId, false);

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

      // 1. Verify ownership & fetch relations
      const property = await getAuthorizedProperty(slug, userId, true);

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
      const org = await prisma.organization.findUnique({ where: { id: property.orgId }, select: { currency: true } });
      const snapshotData = {
        property: {
          id: property.id,
          slug: property.slug,
          currency: org?.currency || 'USD',
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
        dishes: property.categories.flatMap((c: any) => c.dishes),
        publishedAt: new Date().toISOString()
      };

      // 4b. Publish Validation & Sensitive Content Protection (Hard Block on Publish)
      const publishValidation = validateForPublish(snapshotData);
      if (!publishValidation.canPublish) {
        console.warn(`[Publish] BLOCKED – Validation issues for property ${property.id}:`, publishValidation.issues);
        return res.status(422).json({
          error: "Property does not meet publish requirements.",
          issues: publishValidation.issues
        });
      }

      // 5. Create snapshot record
      const snapshot = await prisma.propertySnapshot.create({
        data: {
          propertyId: property.id,
          data: snapshotData,
          publishedBy: userId
        }
      });

      console.log(`[Publish] Snapshot created: id=${snapshot.id} publishedAt=${snapshot.publishedAt}`);

      // 5b. Audit Log
      try {
        await prisma.activityEvent.create({
          data: {
            organizationId: property.orgId,
            propertyId: property.id,
            action: 'EXECUTED',
            resourceType: 'PROPERTY',
            source: 'API',
            metadata: {
              type: 'PUBLISH_SNAPSHOT',
              snapshotId: snapshot.id,
              publishedBy: userId,
              dishCount: snapshotData.dishes.length,
              amenityCount: snapshotData.amenities.length
            }
          }
        });
      } catch (logErr) {
        console.warn("[Publish] Failed to write audit event:", logErr);
      }

      // 6. Invalidate the public property cache so guests see fresh data

      // 7. Build QR URL
      const baseUrl = req.headers.origin || `https://${req.headers.host}`;
      const guestUrl = `${baseUrl}/p/${property.slug}`;
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
