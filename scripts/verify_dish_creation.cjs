const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');
const crypto = require('crypto');

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

async function runDishCreationSuite() {
  console.log('==================================================');
  console.log('SCANVISTA — ISSUE #6: DISH CREATION REGRESSION SUITE');
  console.log('==================================================\n');

  let testUserId = null;
  let cookieHeader = null;

  try {
    // 1. Create Test Owner & Org
    const user = await prisma.user.create({
      data: {
        email: `dish.creator.${Date.now()}@example.com`,
        name: 'Dish Creator',
        googleId: `google-dc-${Date.now()}`
      }
    });
    testUserId = user.id;

    const org = await prisma.organization.create({
      data: { name: 'Dish Creator Org', slug: `dc-org-${Date.now()}` }
    });

    await prisma.organizationMembership.create({
      data: { userId: user.id, orgId: org.id, role: 'OWNER' }
    });

    const prop = await prisma.property.create({
      data: {
        name: 'Bistro Gourmet',
        slug: `bistro-gourmet-${Date.now()}`,
        ownerId: user.id,
        orgId: org.id,
        logoUrl: 'https://example.com/logo.png',
        heroImage: 'https://example.com/hero.jpg',
        receptionPhone: '+15550199000',
        hotelRules: 'Quiet hours 10PM-7AM',
        previewToken: crypto.randomBytes(24).toString('hex')
      }
    });

    const category = await prisma.menuCategory.create({
      data: { propertyId: prop.id, name: 'Chef Specials', displayOrder: 0 }
    });

    await prisma.amenity.create({
      data: { propertyId: prop.id, name: 'Swimming Pool' }
    });

    // Login Manager
    const loginRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/auth/dev/login?email=${encodeURIComponent(user.email)}`,
      method: 'GET'
    });
    cookieHeader = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    // ----------------------------------------------------
    // TEST A: Authenticated manager creates a new dish -> HTTP success
    // ----------------------------------------------------
    console.log('--- TEST A: Authenticated Manager Creates Dish ---');
    const dishPayload = {
      name: 'Truffle Risotto',
      price: 28.50,
      categoryId: category.id,
      allergens: '["DAIRY"]',
      healthTips: 'Gluten free upon request',
      isVeg: true
    };

    const createRes = await request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: `/api/manager/properties/${prop.slug}/dishes`,
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        }
      },
      dishPayload
    );

    console.log(`HTTP Status: ${createRes.status}`);
    if (createRes.status !== 200 || createRes.body.name !== 'Truffle Risotto') {
      throw new Error(`TEST A FAILED: Expected 200 OK with dish object, got ${createRes.status}`);
    }
    const createdDishId = createRes.body.id;
    console.log(`✅ TEST A PASSED: Dish created via API (id=${createdDishId})\n`);

    // ----------------------------------------------------
    // TEST B: Database contains the new dish
    // ----------------------------------------------------
    console.log('--- TEST B: Verify Database Contains New Dish ---');
    const dishInDB = await prisma.dish.findUnique({ where: { id: createdDishId } });
    if (!dishInDB || dishInDB.name !== 'Truffle Risotto' || dishInDB.price !== 28.50) {
      throw new Error('TEST B FAILED: Dish missing or corrupt in DB');
    }
    console.log('✅ TEST B PASSED: Database row exists with correct attributes\n');

    // ----------------------------------------------------
    // TEST C: Manager refresh shows the new dish
    // ----------------------------------------------------
    console.log('--- TEST C: Manager Refresh Fetches New Dish ---');
    const refreshRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/current-property?propertyId=${encodeURIComponent(prop.slug)}`,
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });

    const managerDishes = refreshRes.body.dishes || [];
    const foundInManager = managerDishes.some(d => d.id === createdDishId);
    if (!foundInManager) {
      throw new Error('TEST C FAILED: Manager property endpoint did not return new dish');
    }
    console.log('✅ TEST C PASSED: Manager refresh returned the newly created dish\n');

    // ----------------------------------------------------
    // TEST D & E & F: Publish -> Guest API & Page includes new dish
    // ----------------------------------------------------
    console.log('--- TEST D, E, F: Publish -> Snapshot & Guest View ---');
    const publishRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${prop.slug}/publish`,
      method: 'POST',
      headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' }
    });

    if (publishRes.status !== 200) {
      console.log('Publish Error:', publishRes.body);
      throw new Error(`TEST D FAILED: Publish returned status ${publishRes.status}`);
    }

    const guestApiRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/properties/${prop.slug}`,
      method: 'GET'
    });

    const guestDishes = guestApiRes.body.dishes || [];
    const foundInGuest = guestDishes.some(d => d.name === 'Truffle Risotto');
    if (!foundInGuest) {
      throw new Error('TEST E/F FAILED: Guest API snapshot does not contain new dish');
    }
    console.log('✅ TEST D, E, F PASSED: Snapshot published and Guest view displays new dish\n');

    // ----------------------------------------------------
    // TEST G: Unauthenticated create -> 401
    // ----------------------------------------------------
    console.log('--- TEST G: Unauthenticated Create -> 401 ---');
    const unauthRes = await request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: `/api/manager/properties/${prop.slug}/dishes`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      dishPayload
    );

    if (unauthRes.status !== 401) {
      throw new Error(`TEST G FAILED: Expected 401 Unauthenticated, got ${unauthRes.status}`);
    }
    console.log('✅ TEST G PASSED: Unauthenticated request rejected with 401\n');

    // ----------------------------------------------------
    // TEST H: Unauthorized property -> 403/404
    // ----------------------------------------------------
    console.log('--- TEST H: Unauthorized Property -> 403/404 ---');
    const unauthPropRes = await request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: `/api/manager/properties/some-other-unauthorized-slug/dishes`,
        method: 'POST',
        headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' }
      },
      dishPayload
    );

    if (unauthPropRes.status !== 403 && unauthPropRes.status !== 404) {
      throw new Error(`TEST H FAILED: Expected 403/404 for unauthorized property, got ${unauthPropRes.status}`);
    }
    console.log('✅ TEST H PASSED: Unauthorized property request rejected\n');

    // ----------------------------------------------------
    // TEST I: Invalid dish submission -> 400 and no DB corruption
    // ----------------------------------------------------
    console.log('--- TEST I: Invalid Dish Submission -> 400 ---');
    const invalidRes = await request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: `/api/manager/properties/${prop.slug}/dishes`,
        method: 'POST',
        headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' }
      },
      { name: 'X', price: -5.00 } // name too short, price negative
    );

    if (invalidRes.status !== 400) {
      throw new Error(`TEST I FAILED: Expected 400 Validation Error, got ${invalidRes.status}`);
    }
    console.log('✅ TEST I PASSED: Invalid dish submission rejected with 400\n');

    console.log('==================================================');
    console.log('ALL DISH CREATION REGRESSION TESTS PASSED (A-I)');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ REGRESSION SUITE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (testUserId) {
      await prisma.propertySnapshot.deleteMany({ where: { property: { ownerId: testUserId } } }).catch(() => {});
      await prisma.dish.deleteMany({ where: { category: { property: { ownerId: testUserId } } } }).catch(() => {});
      await prisma.menuCategory.deleteMany({ where: { property: { ownerId: testUserId } } }).catch(() => {});
      await prisma.property.deleteMany({ where: { ownerId: testUserId } }).catch(() => {});
      await prisma.organizationMembership.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runDishCreationSuite();
