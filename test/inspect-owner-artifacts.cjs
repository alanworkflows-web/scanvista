const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function inspectOwnerAndArtifacts() {
  const property = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: { owner: true }
  });

  console.log("=== FISHSTAURANT OWNER INFO ===");
  console.log("Owner ID:", property?.ownerId);
  console.log("Owner Email:", property?.owner?.email);
  console.log("Owner Name:", property?.owner?.name);

  console.log("\n=== INVESTIGATE TEST PROPERTY 982ac4ad ===");
  const testProp = await prisma.property.findFirst({
    where: {
      OR: [
        { name: { contains: '982ac4ad' } },
        { slug: { contains: '982ac4ad' } }
      ]
    },
    include: {
      owner: true,
      amenities: true,
      categories: true,
      guests: true,
      snapshots: true
    }
  });
  console.log("Test Property Found:", testProp ? {
    id: testProp.id,
    name: testProp.name,
    slug: testProp.slug,
    owner: testProp.owner?.email,
    amenitiesCount: testProp.amenities.length,
    categoriesCount: testProp.categories.length,
    guestsCount: testProp.guests.length,
    snapshotsCount: testProp.snapshots.length
  } : "NOT FOUND");

  console.log("\n=== ALL TEST / ARTIFACT PROPERTIES ===");
  const testProps = await prisma.property.findMany({
    where: {
      OR: [
        { name: { startsWith: 'Test Property' } },
        { name: { startsWith: 'Regression Hotel' } },
        { name: { startsWith: 'Registration Hotel' } },
        { name: { startsWith: 'E2E Property' } },
        { name: { startsWith: 'Health Prop' } },
        { name: { startsWith: 'Metrics Prop' } },
        { name: { startsWith: 'Insight Prop' } },
        { name: { startsWith: 'QR Prop' } },
        { name: { startsWith: 'Hostile Prop' } }
      ]
    },
    select: { id: true, name: true, slug: true }
  });
  console.log(`Found ${testProps.length} development artifact properties:`);
  testProps.forEach(p => console.log(`- ${p.name} (${p.slug}) [ID: ${p.id}]`));
}

inspectOwnerAndArtifacts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
