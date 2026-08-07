import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { calculatePropertyStatus } from '../src/lib/propertyStatusEngine';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findFirst({
    where: { slug: { not: 'e2e-amenity-verify-property' } },
    include: {
      categories: { include: { dishes: true } },
      amenities: true,
      snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 },
      subscription: true
    }
  });

  if (!property) {
    console.log("No existing property found");
    return;
  }

  const categories = property.categories || [];
  const dishes = categories.flatMap(c => c.dishes || []);
  const amenities = property.amenities || [];
  const propWithEntities = { ...property, categories, dishes, amenities };
  const status = calculatePropertyStatus({ property: propWithEntities, snapshots: property.snapshots });

  console.log(JSON.stringify({
    endpoint: "/api/manager/current-property",
    property: {
      id: property.id,
      name: property.name,
      slug: property.slug,
      bannerUrl: property.bannerUrl ? "Configured" : "None",
      logoUrl: property.logoUrl ? "Configured" : "None",
      receptionPhone: property.receptionPhone
    },
    counts: {
      categories: categories.length,
      dishes: dishes.length,
      amenities: amenities.length
    },
    statusAndChecklistPayload: {
      completionPercentage: status.completionPercentage,
      totalCount: status.totalCount,
      completedCount: status.completedCount,
      isReady: status.isReady,
      publishState: status.publishState,
      items: status.items.map(i => ({
        id: i.id,
        label: i.label,
        category: i.category,
        completed: i.completed,
        details: i.details
      }))
    }
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
