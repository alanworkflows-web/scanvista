const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function sanitizeProductionData() {
  console.log("=== EXECUTING PRODUCTION DATA SANITIZATION ===");

  const propertySlug = 'fishstaurant';
  const property = await prisma.property.findUnique({
    where: { slug: propertySlug },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      guests: true,
      snapshots: true
    }
  });

  if (!property) {
    throw new Error(`Property ${propertySlug} not found!`);
  }

  console.log(`Found property: ${property.name} (${property.id})`);

  // 1. Update Property core details & contacts
  console.log("\n1. Updating property details and contacts...");
  const cleanContacts = {
    email: "reception@fishstaurant.com",
    phone: "",
    address: "",
    website: "",
    whatsapp: ""
  };

  const updatedProperty = await prisma.property.update({
    where: { id: property.id },
    data: {
      tagline: "Fresh Coastal Dining & Hospitality",
      description: "Welcome to Fishstaurant, offering fresh seasonal dining and coastal hospitality.",
      contacts: cleanContacts,
      receptionPhone: null,
      housekeepingPhone: null,
      emergencyPhone: null,
      roomServicePhone: null
    }
  });
  console.log("✓ Property details updated successfully.");

  // 2. Sanitize Amenities (Replace QA amenities with genuine property amenities)
  console.log("\n2. Sanitizing amenities...");
  // Delete existing QA amenities
  await prisma.amenity.deleteMany({
    where: { propertyId: property.id }
  });

  // Create genuine production amenities
  await prisma.amenity.createMany({
    data: [
      {
        propertyId: property.id,
        name: "High-Speed Wi-Fi",
        description: "Complimentary high-speed wireless internet throughout the property.",
        icon: "📶",
        priority: 1,
        status: "ACTIVE",
        alwaysVisible: true
      },
      {
        propertyId: property.id,
        name: "Front Desk & Concierge",
        description: "24/7 front desk assistance and guest services.",
        icon: "🛎️",
        priority: 2,
        status: "ACTIVE",
        alwaysVisible: true
      }
    ]
  });
  console.log("✓ Amenities sanitized successfully.");

  // 3. Sanitize Categories and Dishes
  console.log("\n3. Sanitizing menu categories & dishes...");
  // Delete empty test categories "bf" and "lunch"
  await prisma.menuCategory.deleteMany({
    where: {
      propertyId: property.id,
      name: { in: ["bf", "lunch"] }
    }
  });

  // Update existing category "breakfast" and its dishes
  const breakfastCat = await prisma.menuCategory.findFirst({
    where: { propertyId: property.id, name: "breakfast" }
  });

  if (breakfastCat) {
    await prisma.menuCategory.update({
      where: { id: breakfastCat.id },
      data: { name: "Breakfast & Brunch" }
    });

    // Update dishes
    await prisma.dish.updateMany({
      where: { categoryId: breakfastCat.id, name: "pancake" },
      data: {
        name: "Artisan Pancakes",
        description: "Fluffy stacked pancakes served with fresh seasonal berries.",
        healthTips: "Freshly prepared daily"
      }
    });

    await prisma.dish.updateMany({
      where: { categoryId: breakfastCat.id, name: "french toast" },
      data: {
        name: "Brioche French Toast",
        description: "Golden brioche with cinnamon, vanilla, and pure maple syrup.",
        healthTips: "Served with pure maple syrup"
      }
    });
  }
  console.log("✓ Menu categories & dishes sanitized successfully.");

  // 4. Delete fake test guests
  console.log("\n4. Deleting fake test guests...");
  const deletedGuests = await prisma.guest.deleteMany({
    where: { propertyId: property.id }
  });
  console.log(`✓ Deleted ${deletedGuests.count} fake guest records.`);

  // 5. Delete stale test snapshots
  console.log("\n5. Purging stale test snapshots...");
  const deletedSnapshots = await prisma.propertySnapshot.deleteMany({
    where: { propertyId: property.id }
  });
  console.log(`✓ Deleted ${deletedSnapshots.count} stale snapshots.`);

  // 6. Fetch clean state to build a fresh, clean published snapshot
  console.log("\n6. Creating fresh published snapshot...");
  const cleanPropData = await prisma.property.findUnique({
    where: { id: property.id },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      org: { select: { currency: true } }
    }
  });

  const snapshotPayload = {
    property: {
      ...cleanPropData,
      currency: cleanPropData?.org?.currency || 'USD'
    },
    categories: cleanPropData?.categories,
    dishes: cleanPropData?.categories?.flatMap(c => c.dishes),
    amenities: cleanPropData?.amenities
  };

  const newSnapshot = await prisma.propertySnapshot.create({
    data: {
      propertyId: property.id,
      data: snapshotPayload,
      version: 1,
      publishedAt: new Date()
    }
  });
  console.log(`✓ Published fresh clean snapshot ID: ${newSnapshot.id}`);

  console.log("\n=== PRODUCTION DATA SANITIZATION COMPLETED SUCCESSFULLY ===");
}

sanitizeProductionData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
