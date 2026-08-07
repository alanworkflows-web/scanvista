import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

import { calculatePropertyStatus } from '../src/lib/propertyStatusEngine';

async function main() {
  const property = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: {
      categories: { include: { dishes: true } },
      amenities: true,
      snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
    }
  });

  if (!property) {
    console.log("Property not found");
    return;
  }

  console.log("=== CALCULATING STATUS FOR 'fishstaurant' ===");
  const status = calculatePropertyStatus(property);
  console.log("Full Status Result:");
  console.log(JSON.stringify({
    completionPercentage: status.completionPercentage,
    completedCount: status.completedCount,
    totalCount: status.totalCount,
    isReady: status.isReady,
    publishState: status.publishState,
    propertyReadiness: status.propertyReadiness,
    items: status.items.map(i => ({ id: i.id, label: i.label, completed: i.completed, details: i.details }))
  }, null, 2));

  await prisma.$disconnect();
}

main();
