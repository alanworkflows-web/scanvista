const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function setBlankEmailAndRepublish() {
  const fish = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      org: { select: { currency: true } }
    }
  });

  if (!fish) return;

  await prisma.property.update({
    where: { id: fish.id },
    data: {
      contacts: {
        email: "",
        phone: "",
        address: "",
        website: "",
        whatsapp: ""
      }
    }
  });

  // Purge and republish snapshot
  await prisma.propertySnapshot.deleteMany({
    where: { propertyId: fish.id }
  });

  const updatedFish = await prisma.property.findUnique({
    where: { id: fish.id },
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      org: { select: { currency: true } }
    }
  });

  const snapData = {
    property: {
      ...updatedFish,
      currency: updatedFish.org?.currency || 'USD'
    },
    categories: updatedFish.categories,
    dishes: updatedFish.categories.flatMap(c => c.dishes),
    amenities: updatedFish.amenities
  };

  const newSnap = await prisma.propertySnapshot.create({
    data: {
      propertyId: updatedFish.id,
      data: snapData,
      publishedAt: new Date()
    }
  });

  console.log(`✓ Updated contacts.email to empty string and republished snapshot: ${newSnap.id}`);
}

setBlankEmailAndRepublish()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
