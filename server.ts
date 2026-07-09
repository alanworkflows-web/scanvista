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

  app.set("trust proxy", 1);

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

  // Webhook needs raw body
  app.post("/webhooks/paddle", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const signature = req.headers['paddle-signature'] as string;
      const rawBody = req.body.toString('utf8');
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET || "test";

      
      let eventData;
      try {
        eventData = paddle.webhooks.unmarshal(rawBody, secretKey, signature || '');
      } catch (e) {
        throw new Error("Invalid signature sync");
      }
      // If it returns a promise
      if (eventData instanceof Promise) {
        eventData = await eventData;
      }
      
      const eventId = eventData?.event_id || eventData?.id;
      if (eventId) {
        try {
          await prisma.webhookEvent.create({ data: { id: eventId, type: eventData.event_type || 'unknown' } });
        } catch (e: any) {
          // P2002 means Unique constraint failed -> duplicate event
          if (e.code === 'P2002') {
            return res.status(200).send("OK");
          }
          throw e;
        }
      }

      if (eventData && eventData.data && (eventData.data as any).custom_data && (eventData.data as any).custom_data.slug) {
        const slug = (eventData.data as any).custom_data.slug;
        const status = (eventData.data as any).status;
        
        const validStatuses = ['active', 'trialing', 'canceled', 'past_due'];
        if (!status || !validStatuses.includes(status)) {
          return res.status(200).send("Unsupported or missing status safely ignored");
        }
        
        const property = await prisma.property.findUnique({ where: { slug } });
        if (property) {
          await prisma.subscription.upsert({
            where: { propertyId: property.id },
            update: { status: status },
            create: { propertyId: property.id, status: status }
          });
        }
      }
      res.status(200).send("OK");
    } catch (err) {
      console.error(err);
      res.status(400).send("Webhook Error");
    }
  });

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
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    bannerUrl: z.string().url().max(1000).optional().or(z.literal("")),
    receptionPhone: z.string().max(50).optional(),
    roomServicePhone: z.string().max(50).optional(),
    housekeepingPhone: z.string().max(50).optional(),
    emergencyPhone: z.string().max(50).optional(),
  });

  const AmenitySchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    openTime: z.string().max(20).optional(),
    closeTime: z.string().max(20).optional(),
    requiresReservation: z.boolean().optional(),
  });

  const DishSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().min(0),
    allergens: z.string().optional(),
    healthTips: z.string().optional(),
    isOutOfStock: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
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
      console.log("⚠️ GOOGLE_CLIENT_ID not configured, using development bypass login");
      
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
      
      // @ts-ignore
      req.session.userId = user.id;
      // @ts-ignore
      req.session.save((err) => {
        return res.redirect("/manager/setup");
      });
      return;
    }

    const state = crypto.randomBytes(32).toString('hex');
    // @ts-ignore
    req.session.oauthState = state;

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      state: state
    });

    // @ts-ignore
    req.session.save((err) => {
      if (err) {
        console.error("Session save error before redirect:", err);
        return res.status(500).send("Failed to initialize OAuth session");
      }
      res.redirect(url);
    });
  });


  app.get("/auth/google/callback", async (req, res) => {
    try {
      

      // @ts-ignore
      const savedState = req.session.oauthState;
      if (!savedState || savedState !== req.query.state) {
        return res.status(400).send("Invalid state parameter");
      }
      
      // Prevent CSRF replay
      // @ts-ignore
      delete req.session.oauthState;
      
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

      // @ts-ignore
      req.session.userId = user.id;
      // @ts-ignore
      req.session.save((err) => {
        return res.redirect("/manager/setup");
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

      res.json({
        property,
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
        where: { ownerId: req.session.userId }
      });
      res.json(properties);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.post("/api/manager/properties", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const property = await prisma.property.create({
        data: {
          name: String(req.body.name || 'New Property'),
          slug: String(req.body.slug || 'prop_' + Date.now()),
          // @ts-ignore
          ownerId: req.session.userId,
        }
      });
      res.json(property);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.put("/api/manager/properties/:slug", requireAuth, async (req, res) => {
    try {
      const validatedData = PropertySchema.parse(req.body);
      const property = await prisma.property.update({
        where: { 
          slug: req.params.slug,
          // @ts-ignore
          ownerId: req.session.userId // prevent IDOR
        },
        data: validatedData
      });
      res.json(property);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      res.status(500).json({ error: "Failed to update property" });
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
    try {
      const validatedData = AmenitySchema.parse(req.body);
      const existing = await prisma.amenity.findUnique({ where: { id: req.params.id }, include: { property: true } });
      // @ts-ignore
      if (!existing || existing.property.ownerId !== req.session.userId) return res.status(403).json({ error: "Unauthorized" });

      const amenity = await prisma.amenity.update({
        where: { id: req.params.id },
        data: validatedData
      });
      res.json(amenity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      res.status(500).json({ error: "Failed to update amenity" });
    }
  });

  app.post("/api/manager/properties/:slug/dishes", requireAuth, async (req, res) => {
    try {
      const validatedData = DishSchema.parse(req.body);
      const property = await prisma.property.findFirst({
        // @ts-ignore
        where: { slug: req.params.slug, ownerId: req.session.userId },
        include: { categories: true }
      });
      if (!property) return res.status(403).json({ error: "Unauthorized" });

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
      const validatedData = DishSchema.parse(req.body);
      const existing = await prisma.dish.findUnique({ where: { id: req.params.id }, include: { category: { include: { property: true } } } });
      // @ts-ignore
      if (!existing || existing.category.property.ownerId !== req.session.userId) return res.status(403).json({ error: "Unauthorized" });

      const dish = await prisma.dish.update({
        where: { id: req.params.id },
        data: {
          name: validatedData.name,
          price: validatedData.price,
          allergens: validatedData.allergens,
          healthTips: validatedData.healthTips,
          isOutOfStock: validatedData.isOutOfStock
        }
      });
      res.json(dish);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation Error", details: err.issues });
      }
      res.status(500).json({ error: "Failed to update dish" });
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
