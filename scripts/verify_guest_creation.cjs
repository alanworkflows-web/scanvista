const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

// Helper to make HTTP requests
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runRegressionSuite() {
  console.log('==================================================');
  console.log('STARTING GUEST CREATION REGRESSION SUITE');
  console.log('==================================================\n');

  let serverProcess = null;
  let testUserId = null;
  let testPropertyId = null;
  let testSlug = `test-guest-prop-${Date.now()}`;
  let unauthPropertySlug = `unauth-prop-${Date.now()}`;
  let createdGuestId = null;
  let createdGuestToken = null;

  try {
    // 1. Setup Test Database Records directly using Prisma
    console.log('Setting up test user, organization & properties in DB...');
    
    // Create Owner User
    const user = await prisma.user.create({
      data: {
        email: `guest.test.${Date.now()}@example.com`,
        name: 'Guest Tester',
        googleId: `google-test-${Date.now()}`
      }
    });
    testUserId = user.id;

    // Create Org & Membership
    const org = await prisma.organization.create({
      data: {
        name: 'Test Guest Org',
        slug: `org-${Date.now()}`
      }
    });

    await prisma.organizationMembership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: 'OWNER'
      }
    });

    // Create Property owned by test user
    const property = await prisma.property.create({
      data: {
        name: 'Guest Test Hotel',
        slug: testSlug,
        ownerId: user.id,
        orgId: org.id
      }
    });
    testPropertyId = property.id;

    // Create Another User & Property (Unauthorized for test user)
    const otherUser = await prisma.user.create({
      data: {
        email: `other.owner.${Date.now()}@example.com`,
        name: 'Other Owner',
        googleId: `google-other-${Date.now()}`
      }
    });

    const otherOrg = await prisma.organization.create({
      data: {
        name: 'Other Org',
        slug: `other-org-${Date.now()}`
      }
    });

    await prisma.organizationMembership.create({
      data: {
        userId: otherUser.id,
        orgId: otherOrg.id,
        role: 'OWNER'
      }
    });

    const unauthProperty = await prisma.property.create({
      data: {
        name: 'Unauth Hotel',
        slug: unauthPropertySlug,
        ownerId: otherUser.id,
        orgId: otherOrg.id
      }
    });

    console.log(`Created test property '${testSlug}' (id: ${testPropertyId})`);
    console.log(`Created unauthorized property '${unauthPropertySlug}'\n`);

    // Log in via /auth/dev/login endpoint to get session cookie
    const loginRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/auth/dev/login?email=${encodeURIComponent(user.email)}`,
      method: 'GET'
    });

    if (loginRes.status !== 302 || !loginRes.headers['set-cookie']) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log('✅ Authenticated successfully with session cookie\n');

    // ----------------------------------------------------
    // TEST A: Authenticated manager creates guest
    // ----------------------------------------------------
    console.log('--- TEST A: Authenticated manager creates guest ---');
    const guestPayload = {
      name: 'Alice Smith',
      phone: '+15551234567',
      roomNumber: 'Suite 404',
      arrivalDate: new Date('2026-09-01T14:00:00Z').toISOString(),
      arrivalTime: new Date('2026-09-01T14:00:00Z').toISOString(),
      notes: 'VIP, Champagne on arrival',
      status: 'BOOKED'
    };

    const createRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${testSlug}/guests`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    }, guestPayload);

    console.log(`HTTP Status: ${createRes.status}`);
    console.log('Response Payload:', createRes.body);

    if (createRes.status !== 201) {
      throw new Error(`TEST A FAILED: Expected 201, got ${createRes.status}`);
    }

    createdGuestId = createRes.body.id;
    createdGuestToken = createRes.body.token;

    // Verify DB row exists directly via Prisma
    const dbGuest = await prisma.guest.findUnique({ where: { id: createdGuestId } });
    if (!dbGuest || dbGuest.name !== 'Alice Smith' || dbGuest.propertyId !== testPropertyId) {
      throw new Error('TEST A FAILED: Guest row not found or mismatched in database');
    }
    console.log(`✅ TEST A PASSED: Guest created in DB with ID: ${createdGuestId}, Token: ${createdGuestToken}\n`);

    // ----------------------------------------------------
    // TEST B: Returned guest token exists & guest URL can be generated / opened
    // ----------------------------------------------------
    console.log('--- TEST B: Returned guest token & guest URL generation ---');
    if (!createdGuestToken) {
      throw new Error('TEST B FAILED: No guest token in response');
    }
    
    const guestJourneyRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/guests/${createdGuestToken}`,
      method: 'GET'
    });

    console.log(`Guest Journey Endpoint (/api/guests/${createdGuestToken}) HTTP Status: ${guestJourneyRes.status}`);
    console.log('Guest Journey Data:', guestJourneyRes.body);

    if (guestJourneyRes.status !== 200 || guestJourneyRes.body.token !== createdGuestToken) {
      throw new Error(`TEST B FAILED: Could not access guest journey for token ${createdGuestToken}`);
    }
    console.log('✅ TEST B PASSED: Guest token generates accessible guest journey URL\n');

    // ----------------------------------------------------
    // TEST C: Manager refreshes Guest page (GET guests)
    // ----------------------------------------------------
    console.log('--- TEST C: Manager fetches guest list ---');
    const getGuestsRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${testSlug}/guests`,
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      }
    });

    console.log(`HTTP Status: ${getGuestsRes.status}`);
    if (getGuestsRes.status !== 200 || !Array.isArray(getGuestsRes.body)) {
      throw new Error(`TEST C FAILED: Expected array of guests, got status ${getGuestsRes.status}`);
    }

    const foundInList = getGuestsRes.body.find(g => g.id === createdGuestId);
    if (!foundInList) {
      throw new Error('TEST C FAILED: Newly created guest not present in guest list');
    }
    console.log('✅ TEST C PASSED: Newly created guest appears in property guest list\n');

    // ----------------------------------------------------
    // TEST D: Unauthenticated create -> 401
    // ----------------------------------------------------
    console.log('--- TEST D: Unauthenticated guest creation ---');
    const unauthCreateRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${testSlug}/guests`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, guestPayload);

    console.log(`HTTP Status: ${unauthCreateRes.status}`);
    if (unauthCreateRes.status !== 401) {
      throw new Error(`TEST D FAILED: Expected 401 Unauthorized, got ${unauthCreateRes.status}`);
    }
    console.log('✅ TEST D PASSED: Unauthenticated guest creation rejected with 401\n');

    // ----------------------------------------------------
    // TEST E: Unauthorized property -> 403/404
    // ----------------------------------------------------
    console.log('--- TEST E: Unauthorized property guest creation ---');
    const unauthorizedPropRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${unauthPropertySlug}/guests`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    }, guestPayload);

    console.log(`HTTP Status: ${unauthorizedPropRes.status}`);
    if (unauthorizedPropRes.status !== 403 && unauthorizedPropRes.status !== 404) {
      throw new Error(`TEST E FAILED: Expected 403 or 404, got ${unauthorizedPropRes.status}`);
    }
    console.log('✅ TEST E PASSED: Unauthorized property guest creation rejected with 403/404\n');

    // ----------------------------------------------------
    // TEST F: Invalid guest submission -> validation error
    // ----------------------------------------------------
    console.log('--- TEST F: Invalid guest submission ---');
    const invalidPayload = {
      name: '', // Empty name
      phone: '123'
    };

    const invalidRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${testSlug}/guests`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    }, invalidPayload);

    console.log(`HTTP Status: ${invalidRes.status}`);
    console.log('Response:', invalidRes.body);

    if (invalidRes.status !== 400) {
      throw new Error(`TEST F FAILED: Expected 400 Bad Request, got ${invalidRes.status}`);
    }
    console.log('✅ TEST F PASSED: Invalid guest submission rejected with 400\n');

    console.log('==================================================');
    console.log('ALL REGRESSION TESTS PASSED (TESTS A-F)');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ REGRESSION SUITE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    // Cleanup DB records
    if (testUserId) {
      await prisma.guest.deleteMany({ where: { propertyId: testPropertyId } }).catch(() => {});
      await prisma.property.deleteMany({ where: { ownerId: testUserId } }).catch(() => {});
      await prisma.organizationMembership.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runRegressionSuite();
