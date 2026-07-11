const { PrismaClient } = require('@prisma/client');

async function main() {
  const url = process.env.DATABASE_URL.replace('ep-tiny-fire-at64srhy-pooler', 'ep-misty-bread-atqgd2qf-pooler').replace('ep-tiny-fire-at64srhy', 'ep-misty-bread-atqgd2qf');
  console.log("Trying to connect to:", url.split('@')[1]); // Safe logging
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log("EP-MISTY CONNECTIVITY: PASS");
    
    const users = await prisma.user.count();
    console.log(`User Count: ${users}`);
    
  } catch (e) {
    console.log("EP-MISTY CONNECTIVITY: FAIL");
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
