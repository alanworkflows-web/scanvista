const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function masterCleanup() {
  console.log("==================== MASTER PRODUCTION DATA CLEANUP ====================");

  // 1. Clean fishstaurant Property
  console.log("\n1. Cleaning 'fishstaurant' property details & contacts...");
  const fishstaurant = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: { owner: true }
  });

  if (!fishstaurant) {
    throw new Error("Property 'fishstaurant' not found!");
  }

  const ownerEmail = fishstaurant.owner?.email || "";

  await prisma.property.update({
    where: { id: fishstaurant.id },
    data: {
      tagline: "Fresh Coastal Dining & Hospitality",
      description: "Welcome to Fishstaurant, offering fresh seasonal dining and coastal hospitality.",
      contacts: {
        email: ownerEmail,
        phone: "",
        address: "",
        website: "",
        whatsapp: ""
      },
      receptionPhone: null,
      housekeepingPhone: null,
      emergencyPhone: null,
      roomServicePhone: null
    }
  });
  console.log(`✓ fishstaurant updated: email set to owner (${ownerEmail}), phones set to null/empty.`);

  // 2. Clean Amenities
  console.log("\n2. Sanitizing amenities...");
  await prisma.amenity.deleteMany({
    where: { propertyId: fishstaurant.id }
  });

  await prisma.amenity.createMany({
    data: [
      {
        propertyId: fishstaurant.id,
        name: "High-Speed Wi-Fi",
        description: "Complimentary high-speed wireless internet throughout the property.",
        icon: "📶",
        priority: 1,
        status: "ACTIVE",
        alwaysVisible: true
      },
      {
        propertyId: fishstaurant.id,
        name: "Front Desk & Concierge",
        description: "24/7 front desk assistance and guest services.",
        icon: "🛎️",
        priority: 2,
        status: "ACTIVE",
        alwaysVisible: true
      }
    ]
  });
  console.log("✓ Amenities sanitized with genuine production records.");

  // 3. Clean Categories & Dishes
  console.log("\n3. Sanitizing menu categories & dishes...");
  await prisma.menuCategory.deleteMany({
    where: {
      propertyId: fishstaurant.id,
      name: { in: ["bf", "lunch", "Test Category"] }
    }
  });

  const breakfastCat = await prisma.menuCategory.findFirst({
    where: {
      propertyId: fishstaurant.id,
      name: { in: ["breakfast", "Breakfast & Brunch"] }
    }
  });

  if (breakfastCat) {
    await prisma.menuCategory.update({
      where: { id: breakfastCat.id },
      data: { name: "Breakfast & Brunch" }
    });

    await prisma.dish.updateMany({
      where: { categoryId: breakfastCat.id, name: { in: ["pancake", "Artisan Pancakes"] } },
      data: {
        name: "Artisan Pancakes",
        description: "Fluffy stacked pancakes served with fresh seasonal berries.",
        healthTips: "Freshly prepared daily"
      }
    });

    await prisma.dish.updateMany({
      where: { categoryId: breakfastCat.id, name: { in: ["french toast", "Brioche French Toast"] } },
      data: {
        name: "Brioche French Toast",
        description: "Golden brioche with cinnamon, vanilla, and pure maple syrup.",
        healthTips: "Served with pure maple syrup"
      }
    });
  }
  console.log("✓ Menu categories & dishes sanitized.");

  // 4. Delete all fake guests
  console.log("\n4. Deleting fake/demo guest records across database...");
  const delGuests = await prisma.guest.deleteMany();
  console.log(`✓ Deleted ${delGuests.count} fake guest records.`);

  // 5. Remove Test Property 982ac4ad and other development artifact properties
  console.log("\n5. Removing development artifact test properties...");
  const artifactProperties = await prisma.property.findMany({
    where: {
      OR: [
        { name: { contains: '982ac4ad' } },
        { slug: { contains: '982ac4ad' } },
        { name: { startsWith: 'Test Property' } },
        { slug: { startsWith: 'prop-' } },
        { slug: { startsWith: 'test-property' } },
        { slug: { startsWith: 'regression-hotel' } },
        { slug: { startsWith: 'health-prop' } },
        { slug: { startsWith: 'metrics-prop' } },
        { slug: { startsWith: 'insight-prop' } },
        { slug: { startsWith: 'qr-prop' } },
        { slug: { startsWith: 'qr-test-prop' } },
        { slug: { startsWith: 'hostile-prop' } },
        { slug: { startsWith: 'e2e-property' } }
      ],
      NOT: {
        slug: 'fishstaurant'
      }
    }
  });

  console.log(`Found ${artifactProperties.length} test artifact properties to remove.`);
  for (const p of artifactProperties) {
    // Delete cascading relations if any
    await prisma.amenity.deleteMany({ where: { propertyId: p.id } });
    await prisma.dish.deleteMany({ where: { category: { propertyId: p.id } } });
    await prisma.menuCategory.deleteMany({ where: { propertyId: p.id } });
    await prisma.guest.deleteMany({ where: { propertyId: p.id } });
    await prisma.propertySnapshot.deleteMany({ where: { propertyId: p.id } });
    await prisma.property.delete({ where: { id: p.id } });
  }
  console.log(`✓ Removed all ${artifactProperties.length} development artifact properties.`);

  // 6. Republish Snapshots for fishstaurant
  console.log("\n6. Purging old snapshots and publishing clean snapshot for fishstaurant...");
  await prisma.propertySnapshot.deleteMany({
    where: { propertyId: fishstaurant.id }
  });

  const fullClean = await prisma.property.findUnique({
    where: { id: fishstaurant.id },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      org: { select: { currency: true } }
    }
  });

  const snapshotPayload = {
    property: {
      ...fullClean,
      currency: fullClean?.org?.currency || 'USD'
    },
    categories: fullClean?.categories,
    dishes: fullClean?.categories?.flatMap(c => c.dishes),
    amenities: fullClean?.amenities
  };

  const newSnap = await prisma.propertySnapshot.create({
    data: {
      propertyId: fishstaurant.id,
      data: snapshotPayload,
      publishedAt: new Date()
    }
  });
  console.log(`✓ Published fresh clean snapshot ID: ${newSnap.id}`);

  console.log("\n==================== MASTER CLEANUP COMPLETED ====================");
}

masterCleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
