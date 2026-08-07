const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient();
  try {
    const properties = await prisma.property.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log("DB_CONNECTION_SUCCESS:", properties);
  } catch (err) {
    console.error("DB_CONNECTION_ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
