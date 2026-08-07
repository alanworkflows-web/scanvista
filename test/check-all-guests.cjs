const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkAllGuests() {
  const guests = await prisma.guest.findMany({
    include: { property: { select: { name: true, slug: true } } }
  });
  console.log(`Total Guests in Database: ${guests.length}`);
  guests.forEach(g => {
    console.log(`Guest: "${g.name}", Room: "${g.roomNumber}", Property: "${g.property?.name}" (${g.property?.slug}), Token: ${g.token}`);
  });
}

checkAllGuests().catch(console.error).finally(() => prisma.$disconnect());
