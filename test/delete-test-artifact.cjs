const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteTestArtifact() {
  console.log("=== REMOVING TEST PROPERTY 982ac4ad & CLEANING LEFTOVER TEST PROPS ===");

  const testProps = await prisma.property.findMany({
    where: {
      OR: [
        { name: { contains: '982ac4ad' } },
        { slug: { contains: '982ac4ad' } },
        { name: { contains: '82990c27' } },
        { slug: { contains: '82990c27' } }
      ]
    }
  });

  for (const p of testProps) {
    console.log(`Deleting ${p.name} (${p.id})...`);
    await prisma.amenity.deleteMany({ where: { propertyId: p.id } });
    await prisma.dish.deleteMany({ where: { category: { propertyId: p.id } } });
    await prisma.menuCategory.deleteMany({ where: { propertyId: p.id } });
    await prisma.guest.deleteMany({ where: { propertyId: p.id } });
    await prisma.propertySnapshot.deleteMany({ where: { propertyId: p.id } });
    await prisma.mediaAsset.deleteMany({ where: { propertyId: p.id } });
    await prisma.subscription.deleteMany({ where: { propertyId: p.id } });
    await prisma.property.delete({ where: { id: p.id } });
    console.log(`✓ Deleted ${p.name}`);
  }

  // Ensure fishstaurant has 1 published snapshot
  const fish = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      org: { select: { currency: true } },
      snapshots: true
    }
  });

  if (fish && fish.snapshots.length === 0) {
    const snapData = {
      property: {
        ...fish,
        currency: fish.org?.currency || 'USD'
      },
      categories: fish.categories,
      dishes: fish.categories.flatMap(c => c.dishes),
      amenities: fish.amenities
    };

    const newSnap = await prisma.propertySnapshot.create({
      data: {
        propertyId: fish.id,
        data: snapData,
        publishedAt: new Date()
      }
    });
    console.log(`✓ Re-published fresh snapshot for fishstaurant: ${newSnap.id}`);
  }
}

deleteTestArtifact()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
