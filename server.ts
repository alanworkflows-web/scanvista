import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const DUMMY_PROPERTIES = [
  {
    id: "prop_1",
    slug: "ocean-hotel",
    name: "Ocean View Hotel",
    description: "Luxury beachfront hotel.",
    bannerUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    propertyType: "HOTEL",
    wifiNetwork: "OceanView_Guest",
    wifiPassword: "relax",
    hostInfo: null,
    houseRules: null,
    experiences: null,
    receptionPhone: "+1234567890",
    housekeepingPhone: "+1234567891",
    emergencyPhone: "+1234567892",
    roomServicePhone: "+1234567893",
    isSubscribed: false,
    subscriptionEndDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    gracePeriodEndsDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    qrPrintsThisMonth: 0
  },
  {
    id: "prop_2",
    slug: "cozy-homestay",
    name: "Cozy Pines Homestay",
    description: "Your home away from home.",
    bannerUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    propertyType: "HOMESTAY",
    wifiNetwork: "CozyPines",
    wifiPassword: "welcomehome",
    hostInfo: "Hi, I'm Sarah! I love hosting guests and cooking.",
    houseRules: "No shoes inside, quiet hours after 10 PM.",
    experiences: "Join us for a morning hike or evening bonfire.",
    receptionPhone: null,
    housekeepingPhone: null,
    emergencyPhone: "+1987654321",
    roomServicePhone: null,
    isSubscribed: true,
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    gracePeriodEndsDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    qrPrintsThisMonth: 0
  }
];

const DUMMY_CATEGORIES = [
  { id: "cat_1", propertyId: "prop_1", name: "🥬 Starters", displayOrder: 1 },
  { id: "cat_2", propertyId: "prop_1", name: "🍛 Mains", displayOrder: 2 },
  { id: "cat_3", propertyId: "prop_1", name: "🧁 Fresh Bakes & Pastries", displayOrder: 3 },
  { id: "cat_4", propertyId: "prop_1", name: "🍹 Coolers & Fresh Juices", displayOrder: 4 },
  { id: "cat_5", propertyId: "prop_1", name: "☕ Specialty Coffee & Tea", displayOrder: 5 },
  { id: "cat_6", propertyId: "prop_1", name: "🍷 Drinks & Beverages", displayOrder: 6 },
  { id: "cat_7", propertyId: "prop_2", name: "Breakfast", displayOrder: 1 },
];

const DUMMY_DISHES = [
  {
    id: "dish_1",
    categoryId: "cat_1",
    name: "Bruschetta al Pomodoro",
    description: "Grilled bread rubbed with garlic and topped with olive oil and salt.",
    price: 8.50,
    imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "Vegan",
    allergens: JSON.stringify(["CEREALS CONTAINING GLUTEN"]),
    healthTips: "Rich in antioxidants from fresh tomatoes.",
    isPopular: true,
    isChefRec: false,
    isOutOfStock: false
  },
  {
    id: "dish_2",
    categoryId: "cat_2",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with seasonal vegetables.",
    price: 26.00,
    imageUrl: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "None",
    allergens: JSON.stringify(["FISH"]),
    healthTips: "Excellent source of Omega-3.",
    isPopular: false,
    isChefRec: true,
    isOutOfStock: false
  },
  {
    id: "dish_3",
    categoryId: "cat_3",
    name: "Warm Sourdough Pastry",
    description: "Freshly baked artisan pastry with a crisp crust.",
    price: 6.50,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "Vegetarian",
    allergens: JSON.stringify(["CEREALS CONTAINING GLUTEN", "MILK"]),
    healthTips: "Made with organic wild yeast.",
    isPopular: true,
    isChefRec: false,
    isOutOfStock: false
  },
  {
    id: "dish_4",
    categoryId: "cat_4",
    name: "Cold-Pressed Antioxidant Berry Juice",
    description: "A refreshing blend of seasonal berries.",
    price: 8.00,
    imageUrl: "https://images.unsplash.com/photo-1570158223689-53e7f91754dd?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "Vegan",
    allergens: JSON.stringify([]),
    healthTips: "Zero added sugar, rich in Vitamin C.",
    isPopular: false,
    isChefRec: true,
    isOutOfStock: false
  },
  {
    id: "dish_5",
    categoryId: "cat_5",
    name: "Oat Milk Iced Matcha Latte",
    description: "Premium ceremonial grade matcha over ice.",
    price: 6.00,
    imageUrl: "https://images.unsplash.com/photo-1582787033502-863a43fa4841?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "Vegan",
    allergens: JSON.stringify([]),
    healthTips: "Packed with antioxidants and slow-release caffeine.",
    isPopular: true,
    isChefRec: false,
    isOutOfStock: false
  },
  {
    id: "dish_6",
    categoryId: "cat_6",
    name: "Sparkling Botanical Tonic",
    description: "A crisp and refreshing tonic infused with herbs.",
    price: 5.50,
    imageUrl: "https://images.unsplash.com/photo-1621262973142-835697793d5a?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "Vegan",
    allergens: JSON.stringify([]),
    healthTips: "Hydrating with natural botanicals.",
    isPopular: false,
    isChefRec: false,
    isOutOfStock: false
  },
  {
    id: "dish_7",
    categoryId: "cat_7",
    name: "Pancakes",
    description: "Fluffy pancakes with maple syrup.",
    price: 12.00,
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80",
    dietaryCategory: "Vegetarian",
    allergens: JSON.stringify(["CEREALS CONTAINING GLUTEN", "MILK", "EGGS"]),
    healthTips: "A comforting start to your day.",
    isPopular: true,
    isChefRec: false,
    isOutOfStock: false
  }
];

const DUMMY_AMENITIES = [
  { id: "am_1", propertyId: "prop_1", name: "Pool", description: "Outdoor heated pool", icon: "Waves", openTime: "07:00", closeTime: "21:00", requiresReservation: false },
  { id: "am_2", propertyId: "prop_1", name: "Gym", description: "24/7 fitness center", icon: "Dumbbell", openTime: "00:00", closeTime: "23:59", requiresReservation: false },
  { id: "am_3", propertyId: "prop_1", name: "Spa", description: "Relaxing massage and facial treatments", icon: "Flower2", openTime: "09:00", closeTime: "18:00", requiresReservation: true },
  { id: "am_4", propertyId: "prop_2", name: "Garden", description: "Relaxing backyard garden", icon: "Flower2", openTime: "06:00", closeTime: "22:00", requiresReservation: false },
];

const DUMMY_GRIEVANCES = [
  { id: "g1", propertyId: "prop_1", timestamp: "2026-06-27T10:00:00Z", room: "302", category: "Housekeeping", status: "Pending" },
  { id: "g2", propertyId: "prop_1", timestamp: "2026-06-27T09:30:00Z", room: "105", category: "Maintenance", status: "In Progress" },
];

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API Routes
  app.get("/api/properties/:slug", (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const property = DUMMY_PROPERTIES.find(r => r.slug === slug);
    
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const categories = DUMMY_CATEGORIES
      .filter(c => c.propertyId === property.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const dishes = DUMMY_DISHES.filter(item => 
      categories.some(c => c.id === item.categoryId)
    );
    
    const amenities = DUMMY_AMENITIES.filter(am => am.propertyId === property.id);
    const grievances = DUMMY_GRIEVANCES.filter(g => g.propertyId === property.id);

    res.json({
      property,
      categories,
      dishes,
      amenities,
      grievances
    });
  });

  app.put("/api/properties/:slug", (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const index = DUMMY_PROPERTIES.findIndex(r => r.slug === slug);
    
    if (index === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    DUMMY_PROPERTIES[index] = {
      ...DUMMY_PROPERTIES[index],
      ...req.body
    };

    res.json(DUMMY_PROPERTIES[index]);
  });

  app.post("/api/properties/:slug/renew", (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const index = DUMMY_PROPERTIES.findIndex(r => r.slug === slug);
    
    if (index === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    DUMMY_PROPERTIES[index].isSubscribed = true;
    DUMMY_PROPERTIES[index].subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    DUMMY_PROPERTIES[index].gracePeriodEndsDate = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();
    DUMMY_PROPERTIES[index].qrPrintsThisMonth = 0; // reset on renew

    res.json(DUMMY_PROPERTIES[index]);
  });

  app.post("/api/properties/:slug/qr-print", (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const index = DUMMY_PROPERTIES.findIndex(r => r.slug === slug);
    
    if (index === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (!DUMMY_PROPERTIES[index].qrPrintsThisMonth) {
      DUMMY_PROPERTIES[index].qrPrintsThisMonth = 0;
    }
    DUMMY_PROPERTIES[index].qrPrintsThisMonth += 1;

    res.json(DUMMY_PROPERTIES[index]);
  });

  app.post("/api/checkout", (req, res) => {
    // In a production environment, you would integrate Razorpay or Paddle server SDKs here:
    // const instance = new Razorpay({ key_id: '...', key_secret: '...' });
    // const options = { amount: 1000, currency: "USD", receipt: "order_rcptid_11" };
    // const order = await instance.orders.create(options);
    
    res.json({
      success: true,
      checkoutSession: "mock_session_id",
      orderId: "mock_order_123"
    });
  });

  app.post("/api/checkout/verify", (req, res) => {
    const { propertySlug, paymentId, signature } = req.body;
    
    // In a real app, verify signature:
    // const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    
    const slug = propertySlug?.toLowerCase();
    const index = DUMMY_PROPERTIES.findIndex(r => r.slug === slug);
    
    if (index === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Equivalent to Prisma: prisma.property.update({ where: { slug }, data: { isSubscribed: true } })
    DUMMY_PROPERTIES[index].isSubscribed = true;
    DUMMY_PROPERTIES[index].subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    DUMMY_PROPERTIES[index].gracePeriodEndsDate = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();
    DUMMY_PROPERTIES[index].qrPrintsThisMonth = 0; // reset on renew

    res.json(DUMMY_PROPERTIES[index]);
  });

  // Paddle Webhook Endpoint (Requested by user)
  app.post("/api/webhooks/paddle", async (req, res) => {
    const { event_type, data } = req.body;

    try {
      if (event_type === 'subscription.created' || event_type === 'subscription.updated') {
        const managerEmail = data.customer?.email;
        const status = data.status; // 'active'

        if (status === 'active' && managerEmail) {
          const now = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(now.getMonth() + 1);

          // Update database: Grant full cell editing rights and calculate the 2-day grace window
          // Mocking Prisma logic with DUMMY_PROPERTIES
          DUMMY_PROPERTIES.forEach(prop => {
            // In a real app, match by ownerEmail. Here we update all for testing purposes.
            prop.isSubscribed = true;
            prop.subscriptionEndDate = nextMonth.toISOString();
            prop.gracePeriodEndsDate = new Date(nextMonth.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString();
            prop.qrPrintsThisMonth = 0;
          });
          
          console.log(`✅ Subscription fully operational for: ${managerEmail}`);
        }
      }
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

  app.put("/api/dishes/:id", (req, res) => {
    const index = DUMMY_DISHES.findIndex(d => d.id === req.params.id);
    if (index !== -1) {
      DUMMY_DISHES[index] = { ...DUMMY_DISHES[index], ...req.body };
      res.json(DUMMY_DISHES[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/dishes", (req, res) => {
    const newDish = { id: `dish_${Date.now()}`, ...req.body };
    DUMMY_DISHES.push(newDish);
    res.json(newDish);
  });

  app.put("/api/amenities/:id", (req, res) => {
    const index = DUMMY_AMENITIES.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
      DUMMY_AMENITIES[index] = { ...DUMMY_AMENITIES[index], ...req.body };
      res.json(DUMMY_AMENITIES[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/amenities", (req, res) => {
    const newAmenity = { id: `am_${Date.now()}`, ...req.body };
    DUMMY_AMENITIES.push(newAmenity);
    res.json(newAmenity);
  });

  app.put("/api/grievances/:id", (req, res) => {
    const index = DUMMY_GRIEVANCES.findIndex(g => g.id === req.params.id);
    if (index !== -1) {
      DUMMY_GRIEVANCES[index] = { ...DUMMY_GRIEVANCES[index], ...req.body };
      res.json(DUMMY_GRIEVANCES[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/grievances", (req, res) => {
    const newGrievance = { id: `g_${Date.now()}`, ...req.body };
    DUMMY_GRIEVANCES.push(newGrievance);
    res.json(newGrievance);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
