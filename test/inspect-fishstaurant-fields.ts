import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  const p = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: {
      categories: { include: { dishes: true } },
      amenities: true
    }
  });

  console.log("=== FISHSTAURANT FIELDS ===");
  console.log({
    id: p?.id,
    name: p?.name,
    logoUrl: p?.logoUrl,
    bannerUrl: p?.bannerUrl?.slice(0, 50),
    heroImage: p?.heroImage?.slice(0, 50),
    receptionPhone: p?.receptionPhone,
    emergencyPhone: p?.emergencyPhone,
    contacts: p?.contacts,
    categoriesCount: p?.categories.length,
    dishesCount: p?.categories.flatMap(c => c.dishes).length,
    amenitiesCount: p?.amenities.length,
    checkInTime: p?.checkInTime,
    checkOutTime: p?.checkOutTime,
    houseRules: p?.houseRules,
    hotelRules: p?.hotelRules
  });

  await prisma.$disconnect();
}

main();
