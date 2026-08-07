const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fullAudit() {
  console.log("==================== FULL DATABASE AUDIT ====================");

  // 1. Users
  const users = await prisma.user.findMany();
  console.log(`\n--- USERS (${users.length}) ---`);
  users.forEach(u => console.log(`User ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`));

  // 2. Organizations
  const orgs = await prisma.organization.findMany();
  console.log(`\n--- ORGANIZATIONS (${orgs.length}) ---`);
  orgs.forEach(o => console.log(`Org ID: ${o.id}, Name: ${o.name}, Slug: ${o.slug}, Currency: ${o.currency}`));

  // 3. Properties
  const properties = await prisma.property.findMany({
    include: {
      amenities: true,
      categories: { include: { dishes: true } },
      guests: true,
      snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
    }
  });
  console.log(`\n--- PROPERTIES (${properties.length}) ---`);
  properties.forEach(p => {
    console.log(`\nProperty: "${p.name}" (Slug: ${p.slug}, ID: ${p.id})`);
    console.log(`  Tagline: "${p.tagline}"`);
    console.log(`  Description: "${p.description}"`);
    console.log(`  Contacts: ${JSON.stringify(p.contacts)}`);
    console.log(`  Phones: Reception="${p.receptionPhone}", Housekeeping="${p.housekeepingPhone}", Emergency="${p.emergencyPhone}", RoomService="${p.roomServicePhone}"`);
    console.log(`  Amenities (${p.amenities.length}):`, p.amenities.map(a => `"${a.name}" (${a.id})`).join(', '));
    console.log(`  Categories (${p.categories.length}):`, p.categories.map(c => `"${c.name}" [${c.dishes.map(d => `"${d.name}" ($${d.price})`).join(', ')}]`).join('; '));
    console.log(`  Guests (${p.guests.length}):`, p.guests.map(g => `"${g.name}" (Room ${g.roomNumber}, Token: ${g.token})`).join(', '));
    console.log(`  Snapshots (${p.snapshots.length})`);
  });

  // 4. All Guests across all properties
  const allGuests = await prisma.guest.findMany();
  console.log(`\n--- ALL GUESTS (${allGuests.length}) ---`);
  allGuests.forEach(g => console.log(`Guest ID: ${g.id}, Name: ${g.name}, Room: ${g.roomNumber}, PropertyId: ${g.propertyId}, Token: ${g.token}`));

  // 5. All Amenities across all properties
  const allAmenities = await prisma.amenity.findMany();
  console.log(`\n--- ALL AMENITIES (${allAmenities.length}) ---`);
  allAmenities.forEach(a => console.log(`Amenity ID: ${a.id}, Name: "${a.name}", PropertyId: ${a.propertyId}`));

  // 6. All Categories & Dishes
  const allCategories = await prisma.menuCategory.findMany();
  const allDishes = await prisma.dish.findMany();
  console.log(`\n--- ALL CATEGORIES (${allCategories.length}) & DISHES (${allDishes.length}) ---`);
  allCategories.forEach(c => console.log(`Category: "${c.name}" (ID: ${c.id}, PropertyId: ${c.propertyId})`));
  allDishes.forEach(d => console.log(`Dish: "${d.name}" ($${d.price}, ID: ${d.id}, CategoryId: ${d.categoryId})`));

  console.log("\n==================== AUDIT COMPLETE ====================");
}

fullAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
