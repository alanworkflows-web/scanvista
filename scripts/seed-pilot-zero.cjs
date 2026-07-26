const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Pilot Zero: Ocean Breeze Resort...");

  // Get first user to act as manager
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No users found. Cannot create mock property.");
    process.exit(1);
  }

  // Ensure an org exists
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({ data: { name: "Ocean Breeze Holdings" } });
  }

  const property = await prisma.property.create({
    data: {
      name: "Ocean Breeze Resort",
      slug: "ocean-breeze-resort",
      orgId: org.id,
      ownerId: user.id,
      heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
      logoUrl: "https://images.unsplash.com/photo-1548625361-9c6bc76313b4?w=200&q=80",
      welcomeMessage: "Welcome to Ocean Breeze Resort. Your tranquil escape awaits.",
      wifiNetwork: "OceanBreeze_Guest",
      wifiPassword: "relaxinthesun",
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      receptionPhone: "+1 (555) 123-4567"
    }
  });

  console.log(`Created property: ${property.name} (${property.slug})`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
