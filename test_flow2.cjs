require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.create({
    data: { email: `test-${Date.now()}@example.com`, name: "Test User", role: "MANAGER" }
  });
  console.log("User created:", user.id);

  const newOrg = await prisma.organization.create({
    data: { name: "Test Org", slug: `test-org-${Date.now()}` }
  });
  await prisma.organizationMembership.create({
    data: { userId: user.id, orgId: newOrg.id, role: 'OWNER' }
  });
  console.log("Org provisioned.");

  const name = "My Property";
  const slug = `slug-${Date.now()}`;
  const membership = await prisma.organizationMembership.findFirst({
    where: { userId: user.id }
  });
  
  if (!membership) {
    console.log("No membership found");
    return;
  }

  const property = await prisma.property.create({
    data: {
      name,
      slug,
      ownerId: user.id,
      orgId: membership.orgId,
    },
    include: { subscription: true }
  });
  console.log("Property created:", property.id);

  // Simulate PUT /api/manager/properties/:slug
  const currentProperty = await prisma.property.findUnique({
    where: { slug: property.slug },
    include: { subscription: true }
  });
  if (!currentProperty || currentProperty.ownerId !== user.id) {
    console.log("Forbidden or property not found");
  } else {
    console.log("PUT allowed!");
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
