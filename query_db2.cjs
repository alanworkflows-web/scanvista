require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const latestProp = await prisma.property.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { owner: true, org: { include: { memberships: true } } }
  });
  console.log(JSON.stringify(latestProp, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
