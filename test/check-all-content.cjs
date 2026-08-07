const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkAllContent() {
  const amenities = await prisma.amenity.findMany({
    include: { property: { select: { name: true, slug: true } } }
  });
  console.log(`\n--- ALL AMENITIES (${amenities.length}) ---`);
  amenities.forEach(a => {
    console.log(`Amenity: "${a.name}" (Property: ${a.property?.name}), Icon: ${a.icon}, Desc: "${a.description}"`);
  });

  const dishes = await prisma.dish.findMany({
    include: { category: { include: { property: { select: { name: true, slug: true } } } } }
  });
  console.log(`\n--- ALL DISHES (${dishes.length}) ---`);
  dishes.forEach(d => {
    console.log(`Dish: "${d.name}" ($${d.price}) (Category: "${d.category?.name}", Property: ${d.category?.property?.name})`);
  });
}

checkAllContent().catch(console.error).finally(() => prisma.$disconnect());
