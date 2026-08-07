const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyDb() {
  console.log("=== FINAL POST-CLEANUP DATABASE VERIFICATION ===");

  const fishstaurant = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      guests: true,
      snapshots: { orderBy: { publishedAt: 'desc' } }
    }
  });

  console.log("\n1. FISHSTAURANT PROPERTY DETAILS:");
  console.log("- Name:", fishstaurant?.name);
  console.log("- Slug:", fishstaurant?.slug);
  console.log("- Tagline:", fishstaurant?.tagline);
  console.log("- Description:", fishstaurant?.description);
  console.log("- Contacts:", JSON.stringify(fishstaurant?.contacts, null, 2));
  console.log("- Reception Phone:", fishstaurant?.receptionPhone);
  console.log("- Housekeeping Phone:", fishstaurant?.housekeepingPhone);
  console.log("- Emergency Phone:", fishstaurant?.emergencyPhone);
  console.log("- Room Service Phone:", fishstaurant?.roomServicePhone);

  console.log("\n2. AMENITIES (" + fishstaurant?.amenities?.length + "):");
  fishstaurant?.amenities?.forEach(a => {
    console.log(`- [${a.icon}] "${a.name}": "${a.description}"`);
  });

  console.log("\n3. MENU CATEGORIES (" + fishstaurant?.categories?.length + "):");
  fishstaurant?.categories?.forEach(c => {
    console.log(`- Category: "${c.name}" (${c.dishes.length} dishes)`);
    c.dishes.forEach(d => {
      console.log(`  * "${d.name}" ($${d.price}): "${d.description}" [Health: "${d.healthTips}"]`);
    });
  });

  console.log("\n4. GUESTS (" + fishstaurant?.guests?.length + "):");
  console.log("Guests in DB for fishstaurant:", fishstaurant?.guests);

  const totalGuests = await prisma.guest.count();
  console.log("Total guests in entire database:", totalGuests);

  console.log("\n5. SNAPSHOTS (" + fishstaurant?.snapshots?.length + "):");
  fishstaurant?.snapshots?.forEach(s => {
    console.log(`- Snapshot ID: ${s.id}, Published At: ${s.publishedAt}`);
  });

  console.log("\n6. TEST PROPERTY 982ac4ad CHECK:");
  const testPropCheck = await prisma.property.findFirst({
    where: {
      OR: [
        { name: { contains: '982ac4ad' } },
        { slug: { contains: '982ac4ad' } }
      ]
    }
  });
  console.log("Test Property 982ac4ad exists in DB:", Boolean(testPropCheck));

  const totalProperties = await prisma.property.count();
  console.log("\nTotal remaining properties in DB:", totalProperties);
}

verifyDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
