const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// Import propertyStatusEngine from built JS
const { calculatePropertyStatus } = require('../src/lib/propertyStatusEngine.ts');

async function main() {
  const property = await prisma.property.findUnique({
    where: { slug: 'fishstaurant' },
    include: {
      categories: { include: { dishes: true } },
      amenities: true,
      snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
    }
  });

  console.log("=== CALCULATING STATUS FOR 'fishstaurant' ===");
  const status = calculatePropertyStatus(property);
  console.log({
    completionPercentage: status.completionPercentage,
    completedCount: status.completedCount,
    totalCount: status.totalCount,
    isReady: status.isReady,
    milestones: status.items.map(i => ({ title: i.title, isComplete: i.isComplete }))
  });

  await prisma.$disconnect();
}

main();
