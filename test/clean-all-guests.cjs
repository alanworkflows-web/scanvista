const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function cleanRemainingGuests() {
  const result = await prisma.guest.deleteMany();
  console.log(`Deleted all ${result.count} test/demo guest records from the database.`);
}

cleanRemainingGuests().catch(console.error).finally(() => prisma.$disconnect());
