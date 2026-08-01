require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const workingUser = await prisma.user.findFirst({
    where: { email: 'demo@example.com' },
    include: {
      memberships: { include: { org: { include: { properties: true } } } },
      properties: true
    }
  });

  const newUser = await prisma.user.findFirst({
    where: { email: 'e2e@example.com' },
    include: {
      memberships: { include: { org: { include: { properties: true } } } },
      properties: true
    }
  });

  console.log("WORKING USER:");
  console.log(JSON.stringify(workingUser, null, 2));
  
  console.log("\nNEW USER:");
  console.log(JSON.stringify(newUser, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
