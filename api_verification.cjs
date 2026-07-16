const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== API Verification ===");
  console.log("Simulating Manager Request: POST /api/manager/properties/:slug/guests");
  
  const property = await prisma.property.findFirst();
  if (!property) {
    console.log("No property found. Run app first.");
    return;
  }

  const payload = {
    name: "API Test Guest",
    phone: "+1 555 123 4567",
    roomNumber: "999",
    arrivalDate: new Date().toISOString(),
    arrivalTime: new Date().toISOString(),
    notes: "VIP, Verification Test",
    status: "BOOKED"
  };
  
  console.log("Request Body:");
  console.log(JSON.stringify(payload, null, 2));

  // Simulate creation
  const guest = await prisma.guest.create({
    data: {
      ...payload,
      propertyId: property.id
    }
  });

  console.log("\nResponse Body (Creation):");
  console.log(JSON.stringify(guest, null, 2));

  console.log(`\nSimulating Public Request: GET /api/guests/${guest.token}`);
  const fetchedGuest = await prisma.guest.findUnique({
    where: { token: guest.token },
    include: {
      property: {
        select: { slug: true, name: true, propertyType: true }
      }
    }
  });

  console.log("\nResponse Body (Public Fetch):");
  console.log(JSON.stringify({
    token: fetchedGuest.token,
    name: fetchedGuest.name,
    roomNumber: fetchedGuest.roomNumber,
    notes: fetchedGuest.notes,
    status: fetchedGuest.status,
    linkViewedAt: new Date().toISOString(), // simulated update
    property: fetchedGuest.property
  }, null, 2));

  // Cleanup
  await prisma.guest.delete({ where: { id: guest.id } });
  console.log("\n=== Verification Complete ===");
}

run().catch(console.error).finally(() => prisma.$disconnect());
