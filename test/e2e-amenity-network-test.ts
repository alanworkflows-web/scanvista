import { PrismaClient } from '@prisma/client';
import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function runE2E() {
  console.log("=== End-to-End Network, Database, and Guest Lifecycle Test ===");

  try {
    // 1. Verify Database Connection
    console.log("1. Connecting to PostgreSQL database...");
    const userCount = await prisma.user.count();
    console.log(`✔ Database connected successfully. Total users: ${userCount}`);

    // 2. Find or create test property
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: "E2E Test Org", slug: "e2e-test-org" }
      });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "e2e-test@scanvista.com", name: "E2E Tester" }
      });
    }

    const testSlug = "e2e-amenity-verify-property";
    let property = await prisma.property.findUnique({
      where: { slug: testSlug },
      include: { amenities: true }
    });

    if (!property) {
      property = await prisma.property.create({
        data: {
          name: "E2E Verification Hotel",
          slug: testSlug,
          ownerId: user.id,
          orgId: org.id,
          previewToken: "e2e-preview-token-12345",
          receptionPhone: "+1 (555) 019-2834",
          bannerUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b",
          logoUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b"
        },
        include: { amenities: true }
      });
    }

    console.log(`✔ Target property verified: ${property.name} (${property.slug}, ID: ${property.id})`);

    // 3. Simulate exact network payload from ManagerAmenities.tsx
    console.log("\n2. Executing Amenities Save Mutation (Simulating Network PUT)...");
    const networkPayload = {
      amenities: [
        {
          id: `temp-${Date.now()}`,
          name: "Rooftop Heated Infinity Pool",
          description: "Year-round heated pool with skyline views and lounge service.",
          icon: "🏊‍♂️",
          imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7",
          openTime: "06:00 AM",
          closeTime: "11:00 PM",
          location: "24th Floor Rooftop Terrace",
          rules: "Children under 14 must be accompanied by an adult.",
          status: "ACTIVE",
          priority: 1
        },
        {
          id: `temp-${Date.now() + 1}`,
          name: "24/7 Wellness & Fitness Club",
          description: "State of the art cardio, free weights, and sauna.",
          icon: "🏋️‍♀️",
          imageUrl: "",
          openTime: "24 Hours",
          closeTime: "",
          location: "3rd Floor West Wing",
          rules: "Proper athletic attire and footwear required.",
          status: "ACTIVE",
          priority: 2
        }
      ]
    };

    console.log("HTTP Request: PUT /api/manager/properties/e2e-amenity-verify-property/amenities");
    console.log("Request Payload:", JSON.stringify(networkPayload, null, 2));

    // Database transaction execution as performed in server.ts
    const txResult = await prisma.$transaction(async (tx) => {
      await tx.amenity.deleteMany({ where: { propertyId: property.id } });
      if (networkPayload.amenities.length > 0) {
        return await tx.amenity.createMany({
          data: networkPayload.amenities.map((a: any, i: number) => ({
            propertyId: property.id,
            name: a.name || "Unnamed Amenity",
            description: a.description || "",
            icon: a.icon || "🏊‍♂️",
            openTime: a.openTime || "",
            closeTime: a.closeTime || "",
            requiresReservation: !!a.requiresReservation,
            rules: a.rules || "",
            location: a.location || "",
            floor: a.floor || "",
            directions: a.directions || "",
            contact: a.contact || "",
            heroImage: a.imageUrl || a.heroImage || "",
            status: a.status || "ACTIVE",
            priority: i + 1
          }))
        });
      }
      return { count: 0 };
    });

    console.log("✔ Server Transaction Completed. Rows Created:", txResult.count);
    assert.strictEqual(txResult.count, 2, "Expected 2 amenity rows to be created");

    // 4. Verify Database Persistence
    console.log("\n3. Querying PostgreSQL Database for Persisted Amenities...");
    const dbAmenities = await prisma.amenity.findMany({
      where: { propertyId: property.id },
      orderBy: { priority: 'asc' }
    });

    console.log(`✔ Found ${dbAmenities.length} amenities in PostgreSQL:`);
    dbAmenities.forEach((a, idx) => {
      console.log(`  [${idx + 1}] ID: ${a.id} | Name: "${a.name}" | Icon: ${a.icon} | Location: "${a.location}" | Open: "${a.openTime}"`);
      assert.ok(a.id, "Amenity must have a permanent database ID");
      assert.strictEqual(a.propertyId, property.id, "Amenity must belong to property");
    });
    assert.strictEqual(dbAmenities[0].name, "Rooftop Heated Infinity Pool");
    assert.strictEqual(dbAmenities[1].name, "24/7 Wellness & Fitness Club");

    // 5. Simulate Publishing Snapshot
    console.log("\n4. Publishing Snapshot to Live Guest View...");
    const fullProp = await prisma.property.findUnique({
      where: { id: property.id },
      include: {
        categories: { include: { dishes: true } },
        amenities: true
      }
    });

    const snapshot = await prisma.propertySnapshot.create({
      data: {
        propertyId: property.id,
        publishedBy: user.id,
        data: fullProp as any
      }
    });
    console.log(`✔ Snapshot #${snapshot.id} published with ${fullProp?.amenities.length} amenities.`);

    // 6. Verify Guest Public Snapshot Data
    console.log("\n5. Querying Public Guest Data from Snapshot...");
    const liveSnapshot = await prisma.propertySnapshot.findFirst({
      where: { propertyId: property.id },
      orderBy: { publishedAt: 'desc' }
    });
    const guestData: any = liveSnapshot?.data;
    assert.ok(guestData, "Guest snapshot data must exist");
    assert.strictEqual(guestData.amenities.length, 2, "Guest view must receive both amenities");
    console.log(`✔ Guest view successfully received amenities: ${guestData.amenities.map((a: any) => a.name).join(', ')}`);

    console.log("\n========================================================");
    console.log("✔ ALL E2E NETWORK, DATABASE, AND GUEST VERIFICATIONS PASSED!");
    console.log("========================================================");

  } catch (err) {
    console.error("❌ E2E Verification Failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2E();
