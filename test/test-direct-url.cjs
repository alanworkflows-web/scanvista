const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const directUrl = process.env.DIRECT_URL;
console.log("Testing direct URL:", directUrl ? "Found" : "Missing");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl || process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Connected successfully! User:", user ? user.email : "None");
  } catch (err) {
    console.error("Direct connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
