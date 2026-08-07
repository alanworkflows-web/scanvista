const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkOtherProps() {
  const propsWithData = await prisma.property.findMany({
    where: {
      OR: [
        { guests: { some: {} } },
        { snapshots: { some: {} } },
        { amenities: { some: {} } },
        { categories: { some: {} } }
      ]
    },
    include: {
      guests: true,
      snapshots: true,
      amenities: true,
      categories: { include: { dishes: true } }
    }
  });

  console.log(`Found ${propsWithData.length} properties with associated data:`);
  propsWithData.forEach(p => {
    console.log(`- Property: "${p.name}" (Slug: ${p.slug}, ID: ${p.id})`);
    console.log(`  Guests: ${p.guests.length}, Snapshots: ${p.snapshots.length}, Amenities: ${p.amenities.length}, Categories: ${p.categories.length}`);
  });
}

checkOtherProps().catch(console.error).finally(() => prisma.$disconnect());
