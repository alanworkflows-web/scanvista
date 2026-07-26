const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding Demo Tenant...");

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: 'demo@oceanbreeze.com' },
    update: {},
    create: {
      email: 'demo@oceanbreeze.com',
      name: 'Elena Vance',
      role: 'MANAGER',
    }
  });

  // 2. Create Organization
  const orgSlug = `ocean-breeze-demo-${Date.now()}`;
  const org = await prisma.organization.create({
    data: {
      name: 'Ocean Breeze Hospitality Group',
      slug: orgSlug,
      memberships: {
        create: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  });

  // 3. Create Properties
  const prop1 = await prisma.property.create({
    data: {
      orgId: org.id,
      ownerId: user.id,
      name: 'Ocean Breeze Resort - Malibu',
      slug: `ob-malibu-${Date.now()}`,
      description: 'Luxury beachfront resort offering panoramic ocean views.',
      propertyType: 'RESORT',
      wifiNetwork: 'OceanBreeze_Guest',
      wifiPassword: 'relaxandunwind'
    }
  });

  const prop2 = await prisma.property.create({
    data: {
      orgId: org.id,
      ownerId: user.id,
      name: 'Ocean Breeze Boutique - Santa Monica',
      slug: `ob-sm-${Date.now()}`,
      description: 'Intimate boutique hotel in the heart of Santa Monica.',
      propertyType: 'HOTEL',
      wifiNetwork: 'OceanBreeze_SM',
      wifiPassword: 'santamonica'
    }
  });

  // 4. Seed Menus for Prop 1
  const catBreakfast = await prisma.menuCategory.create({
    data: {
      propertyId: prop1.id,
      name: 'Sunrise Breakfast',
      displayOrder: 1,
      dishes: {
        create: [
          { name: 'Avocado Toast', price: 18.00, description: 'Smashed avocado, poached egg, chili flakes on sourdough.', allergens: '["Gluten", "Egg"]', isPopular: true },
          { name: 'Acai Bowl', price: 15.00, description: 'Organic acai, fresh berries, house granola, honey.', allergens: '["Nuts"]', healthTips: 'High in antioxidants' }
        ]
      }
    }
  });

  const catDinner = await prisma.menuCategory.create({
    data: {
      propertyId: prop1.id,
      name: 'Coastal Dinner',
      displayOrder: 2,
      dishes: {
        create: [
          { name: 'Seared Scallops', price: 34.00, description: 'Diver scallops, sweet corn purée, pancetta crisp.', isChefRec: true },
          { name: 'Wagyu Burger', price: 28.00, description: '8oz Wagyu beef, truffle aioli, aged cheddar, brioche bun.', isPopular: true }
        ]
      }
    }
  });

  // 5. Seed Amenities for Prop 1
  await prisma.amenity.createMany({
    data: [
      { propertyId: prop1.id, name: 'Infinity Pool', openTime: '06:00', closeTime: '22:00', icon: 'waves' },
      { propertyId: prop1.id, name: 'Serenity Spa', openTime: '08:00', closeTime: '20:00', requiresReservation: true, icon: 'spa' }
    ]
  });

  // 6. Seed Guests for Prop 1
  await prisma.guest.createMany({
    data: [
      { propertyId: prop1.id, name: 'Marcus Sterling', phone: '+15550101', roomNumber: '402', status: 'STAYING', arrivalDate: new Date() },
      { propertyId: prop1.id, name: 'Sarah Jenkins', phone: '+15550102', roomNumber: '115', status: 'CHECKED_IN', arrivalDate: new Date() },
      { propertyId: prop1.id, name: 'David Chen', phone: '+15550103', status: 'BOOKED', arrivalDate: new Date(Date.now() + 86400000) }
    ]
  });

  // 7. Seed Activity Events (History)
  const pastEvents = [];
  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random within last 7 days
    pastEvents.push({
      id: crypto.randomUUID(),
      organizationId: org.id,
      propertyId: prop1.id,
      actorId: user.id,
      resourceType: 'DISH',
      action: 'CREATED',
      metadata: { name: 'Demo Menu Item' },
      timestamp
    });
  }
  
  pastEvents.push({
    id: crypto.randomUUID(),
    organizationId: org.id,
    propertyId: prop1.id,
    actorId: user.id,
    resourceType: 'PROPERTY',
    action: 'CREATED',
    metadata: { name: prop1.name },
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  });

  await prisma.activityEvent.createMany({ data: pastEvents });

  console.log("✅ Demo Tenant Seeded Successfully.");
  console.log(`Login Email: ${user.email}`);
  console.log(`Organization: ${org.name}`);
  console.log(`Properties: ${prop1.name}, ${prop2.name}`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
