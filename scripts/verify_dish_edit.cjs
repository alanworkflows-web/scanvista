const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

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
  console.log('STARTING DISH EDIT REGRESSION SUITE');
  console.log('==================================================\n');

  let testUserId = null;
  let testPropertyId = null;
  let testSlug = `test-dish-prop-${Date.now()}`;
  let unauthPropertySlug = `unauth-dish-prop-${Date.now()}`;
  let dish1Id = null;
  let dish2Id = null;
  let unauthDishId = null;
  let cookieHeader = null;

  try {
    console.log('Setting up test user, properties, categories & dishes in DB...');

    // 1. Create Owner User
    const user = await prisma.user.create({
      data: {
        email: `dish.test.${Date.now()}@example.com`,
        name: 'Dish Tester',
        googleId: `google-dish-${Date.now()}`
      }
    });
    testUserId = user.id;

    // Create Org & Membership
    const org = await prisma.organization.create({
      data: {
        name: 'Test Dish Org',
        slug: `dish-org-${Date.now()}`
      }
    });

    await prisma.organizationMembership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: 'OWNER'
      }
    });

    // Create Authorized Property
    const property = await prisma.property.create({
      data: {
        name: 'Dish Test Resort',
        slug: testSlug,
        ownerId: user.id,
        orgId: org.id
      }
    });
    testPropertyId = property.id;

    // Create Category & 2 Dishes for Authorized Property
    const category = await prisma.menuCategory.create({
      data: {
        propertyId: property.id,
        name: 'Main Courses',
        displayOrder: 1
      }
    });

    const dish1 = await prisma.dish.create({
      data: {
        categoryId: category.id,
        name: 'Original Dish 1',
        price: 15.99,
        allergens: '[]',
        healthTips: 'Freshly prepared',
        isVeg: true
      }
    });
    dish1Id = dish1.id;

    const dish2 = await prisma.dish.create({
      data: {
        categoryId: category.id,
        name: 'Original Dish 2',
        price: 22.50,
        allergens: '[]',
        healthTips: 'Chef Special',
        isVeg: false
      }
    });
    dish2Id = dish2.id;

    // Create Unauthorized User, Property, Category & Dish
    const otherUser = await prisma.user.create({
      data: {
        email: `other.dish.${Date.now()}@example.com`,
        name: 'Other Dish Owner',
        googleId: `google-other-dish-${Date.now()}`
      }
    });

    const otherOrg = await prisma.organization.create({
      data: {
        name: 'Other Dish Org',
        slug: `other-dish-org-${Date.now()}`
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
        name: 'Unauth Dish Resort',
        slug: unauthPropertySlug,
        ownerId: otherUser.id,
        orgId: otherOrg.id
      }
    });

    const unauthCategory = await prisma.menuCategory.create({
      data: {
        propertyId: unauthProperty.id,
        name: 'Unauth Category'
      }
    });

    const unauthDish = await prisma.dish.create({
      data: {
        categoryId: unauthCategory.id,
        name: 'Unauth Dish',
        price: 99.99
      }
    });
    unauthDishId = unauthDish.id;

    console.log(`Created property '${testSlug}' with dishes '${dish1.name}' (${dish1Id}) & '${dish2.name}' (${dish2Id})\n`);

    // Authenticate
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
    cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log('✅ Authenticated successfully with session cookie\n');

    // ----------------------------------------------------
    // TEST A: Authenticated manager edits an existing dish
    // ----------------------------------------------------
    console.log('--- TEST A: Authenticated manager edits existing dish ---');
    const editPayload = {
      name: 'Updated Deluxe Dish 1',
      price: 18.75,
      categoryId: category.id,
      allergens: '["Nuts"]',
      healthTips: 'Updated Health Tips',
      isVeg: true,
      isPopular: true
    };

    const putRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/dishes/${dish1Id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    }, editPayload);

    console.log(`HTTP Status: ${putRes.status}`);
    console.log('Response Payload:', putRes.body);

    if (putRes.status !== 200) {
      throw new Error(`TEST A FAILED: Expected 200, got ${putRes.status}`);
    }
    console.log('✅ TEST A PASSED: HTTP 200 response returned on dish edit\n');

    // ----------------------------------------------------
    // TEST B: Database row reflects changed name & price
    // ----------------------------------------------------
    console.log('--- TEST B: Database row reflects updated values ---');
    const dbDish1 = await prisma.dish.findUnique({ where: { id: dish1Id } });
    if (!dbDish1) {
      throw new Error('TEST B FAILED: Dish 1 not found in DB');
    }
    console.log(`DB Dish Name: '${dbDish1.name}', Price: ${dbDish1.price}`);
    if (dbDish1.name !== 'Updated Deluxe Dish 1' || dbDish1.price !== 18.75) {
      throw new Error('TEST B FAILED: Database row name or price does not match updated values');
    }
    console.log('✅ TEST B PASSED: Database row accurately reflects updated name and price\n');

    // ----------------------------------------------------
    // TEST C: Refreshing Manager Menu still shows changed value
    // ----------------------------------------------------
    console.log('--- TEST C: Refreshing Manager Menu returns updated values ---');
    const managerPropRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/current-property?propertyId=${encodeURIComponent(testSlug)}`,
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      }
    });

    console.log(`HTTP Status: ${managerPropRes.status}`);
    if (managerPropRes.status !== 200 || !Array.isArray(managerPropRes.body.dishes)) {
      throw new Error(`TEST C FAILED: Expected 200 with dishes array, got status ${managerPropRes.status}`);
    }

    const refreshedDish = managerPropRes.body.dishes.find(d => d.id === dish1Id);
    if (!refreshedDish || refreshedDish.name !== 'Updated Deluxe Dish 1' || refreshedDish.price !== 18.75) {
      throw new Error(`TEST C FAILED: Refreshed Manager Menu dish data does not match updated values`);
    }
    console.log('✅ TEST C PASSED: Manager Menu refresh fetches updated dish values from live DB\n');

    // ----------------------------------------------------
    // TEST D: Unauthenticated edit -> 401
    // ----------------------------------------------------
    console.log('--- TEST D: Unauthenticated dish edit ---');
    const unauthEditRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/dishes/${dish1Id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, editPayload);

    console.log(`HTTP Status: ${unauthEditRes.status}`);
    if (unauthEditRes.status !== 401) {
      throw new Error(`TEST D FAILED: Expected 401 Unauthorized, got ${unauthEditRes.status}`);
    }
    console.log('✅ TEST D PASSED: Unauthenticated dish edit rejected with 401\n');

    // ----------------------------------------------------
    // TEST E: Unauthorized property/dish -> 403/404
    // ----------------------------------------------------
    console.log('--- TEST E: Unauthorized dish edit ---');
    const unauthorizedDishRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/dishes/${unauthDishId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    }, editPayload);

    console.log(`HTTP Status: ${unauthorizedDishRes.status}`);
    if (unauthorizedDishRes.status !== 403 && unauthorizedDishRes.status !== 404) {
      throw new Error(`TEST E FAILED: Expected 403 or 404, got ${unauthorizedDishRes.status}`);
    }
    console.log('✅ TEST E PASSED: Unauthorized dish edit rejected with 403/404\n');

    // ----------------------------------------------------
    // TEST F: Invalid dish input -> 400 validation error
    // ----------------------------------------------------
    console.log('--- TEST F: Invalid dish input ---');
    const invalidPayload = {
      name: '', // Empty name
      price: -50 // Negative price
    };

    const invalidRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/dishes/${dish1Id}`,
      method: 'PUT',
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

    // Verify DB was NOT corrupted
    const dbDishAfterInvalid = await prisma.dish.findUnique({ where: { id: dish1Id } });
    if (dbDishAfterInvalid.name !== 'Updated Deluxe Dish 1' || dbDishAfterInvalid.price !== 18.75) {
      throw new Error('TEST F FAILED: Database record was corrupted by invalid request');
    }
    console.log('✅ TEST F PASSED: Invalid dish submission rejected with 400 and DB untouched\n');

    // ----------------------------------------------------
    // TEST G: Editing one dish does not alter another dish
    // ----------------------------------------------------
    console.log('--- TEST G: Editing Dish 1 does not alter Dish 2 ---');
    const dbDish2 = await prisma.dish.findUnique({ where: { id: dish2Id } });
    if (dbDish2.name !== 'Original Dish 2' || dbDish2.price !== 22.50) {
      throw new Error(`TEST G FAILED: Dish 2 was unintentionally altered (Name: '${dbDish2.name}', Price: ${dbDish2.price})`);
    }
    console.log('✅ TEST G PASSED: Dish 2 remains completely unaltered\n');

    console.log('==================================================');
    console.log('ALL REGRESSION TESTS PASSED (TESTS A-G)');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ REGRESSION SUITE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    // Cleanup DB records
    if (testUserId) {
      await prisma.dish.deleteMany({ where: { category: { propertyId: testPropertyId } } }).catch(() => {});
      await prisma.menuCategory.deleteMany({ where: { propertyId: testPropertyId } }).catch(() => {});
      await prisma.property.deleteMany({ where: { ownerId: testUserId } }).catch(() => {});
      await prisma.organizationMembership.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runRegressionSuite();
