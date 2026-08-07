const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'c1428d33-a88c-4e3b-8525-d9dbdb75f27a' }
  });
  console.log("User for fishstaurant:", user);

  // Also check if any property already has slug 'fishstaurant'
  const existingBySlug = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' }
  });
  console.log("Property with slug 'fishstaurant':", existingBySlug ? existingBySlug.id : "None");

  if (!existingBySlug) {
    // Update slug to fishstaurant
    const updated = await prisma.property.update({
      where: { id: '2c73a1eb-cbda-4bae-9b26-1282d7066459' },
      data: { slug: 'fishstaurant' }
    });
    console.log("Updated property slug to 'fishstaurant':", updated.slug);
  }

  await prisma.$disconnect();
}

main();
