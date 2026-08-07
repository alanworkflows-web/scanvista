const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function checkFishstaurant() {
  console.log("=== INSPECTING PROPERTY 'fishstaurant' IN DATABASE ===");
  try {
    const property = await prisma.property.findFirst({
      where: {
        OR: [
          { slug: 'fishstaurant' },
          { name: { contains: 'fish', mode: 'insensitive' } }
        ]
      },
      include: {
        categories: { include: { dishes: true } },
        amenities: true,
        org: true,
        snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
      }
    });

    if (!property) {
      console.log("Property 'fishstaurant' not found. Listing all properties in DB:");
      const allProps = await prisma.property.findMany({
        select: { id: true, name: true, slug: true, status: true, ownerId: true }
      });
      console.log(JSON.stringify(allProps, null, 2));
      return;
    }

    console.log("Found Property:", {
      id: property.id,
      name: property.name,
      slug: property.slug,
      status: property.status,
      ownerId: property.ownerId,
      orgId: property.orgId,
      categoriesCount: property.categories.length,
      dishesCount: property.categories.flatMap(c => c.dishes).length,
      amenitiesCount: property.amenities.length,
      snapshotsCount: property.snapshots.length
    });

    console.log("\nAmenities list:");
    console.log(property.amenities);

  } catch (err) {
    console.error("DB inspection error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkFishstaurant();
