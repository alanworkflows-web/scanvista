const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  const sessions = await prisma.session.findMany({
    orderBy: { expiresAt: 'desc' },
    take: 10
  });
  console.log("Sessions count:", sessions.length);
  sessions.forEach(s => {
    console.log({
      id: s.id,
      sid: s.sid,
      expiresAt: s.expiresAt,
      data: s.data
    });
  });
  await prisma.$disconnect();
}

main();
