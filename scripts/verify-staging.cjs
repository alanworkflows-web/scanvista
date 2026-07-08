const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Verifying Prisma client...");
    const user = await prisma.user.upsert({
      where: { email: 'staging-test@scanvista.example.com' },
      update: {},
      create: {
        email: 'staging-test@scanvista.example.com',
        name: 'Staging Verifier',
        role: 'MANAGER',
      }
    });
    console.log("User verified:", user.id);

    console.log("Verifying Session persistence...");
    const session = await prisma.session.upsert({
      where: { sid: 'test-session-123' },
      update: {},
      create: {
        id: 'test-session-123',
        sid: 'test-session-123',
        data: JSON.stringify({ userId: user.id }),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });
    console.log("Session verified:", session.sid);

    console.log("Verifying Property write...");
    const property = await prisma.property.upsert({
      where: { slug: 'staging-verify-prop' },
      update: {},
      create: {
        ownerId: user.id,
        name: 'Staging Verify Property',
        slug: 'staging-verify-prop',
        propertyType: 'HOTEL'
      }
    });
    console.log("Property verified:", property.slug);

    console.log("Verifying Property update...");
    const updatedProperty = await prisma.property.update({
      where: { slug: 'staging-verify-prop' },
      data: { name: 'Staging Verify Property Updated' }
    });
    console.log("Property update verified:", updatedProperty.name);

    console.log("Verifying Amenity write...");
    const amenity = await prisma.amenity.findFirst({
      where: { propertyId: property.id, name: 'Staging Amenity' }
    });
    if (!amenity) {
      await prisma.amenity.create({
        data: {
          propertyId: property.id,
          name: 'Staging Amenity'
        }
      });
    }
    console.log("Amenity verified.");

    console.log("Verifying Guest read...");
    const guestRead = await prisma.property.findUnique({
      where: { slug: 'staging-verify-prop' },
      include: { amenities: true }
    });
    console.log("Guest read verified:", guestRead.name, "with", guestRead.amenities.length, "amenities.");

    console.log("Verifying WebhookEvent persistence...");
    const hook = await prisma.webhookEvent.upsert({
      where: { id: 'evt_test_staging' },
      update: {},
      create: {
        id: 'evt_test_staging',
        type: 'subscription.created'
      }
    });
    console.log("Webhook verified:", hook.id);
    
    console.log("Verifying Duplicate Event Handling...");
    try {
      await prisma.webhookEvent.create({
        data: {
          id: 'evt_test_staging',
          type: 'subscription.created'
        }
      });
      throw new Error("Duplicate event was not rejected!");
    } catch (e) {
      if (e.code === 'P2002') {
        console.log("Duplicate event handling verified (caught P2002).");
      } else {
        throw e;
      }
    }

    console.log("\nALL STAGING VERIFICATIONS PASSED.");
    process.exit(0);
  } catch (err) {
    console.error("STAGING VERIFICATION FAILED:", err);
    process.exit(1);
  }
}

run();
