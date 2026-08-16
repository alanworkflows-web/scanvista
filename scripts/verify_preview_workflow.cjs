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

async function runPreviewWorkflowRegressionSuite() {
  console.log('==================================================');
  console.log('PREVIEW & PUBLISH WORKFLOW REGRESSION SUITE');
  console.log('==================================================\n');

  let testUserId = null;
  let cookieHeader = null;

  try {
    // 1. Create Test Owner User & Org
    const user = await prisma.user.create({
      data: {
        email: `workflow.tester.${Date.now()}@example.com`,
        name: 'Workflow Tester',
        googleId: `google-wf-${Date.now()}`
      }
    });
    testUserId = user.id;

    const org = await prisma.organization.create({
      data: {
        name: 'Workflow Test Org',
        slug: `wf-org-${Date.now()}`
      }
    });

    await prisma.organizationMembership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: 'OWNER'
      }
    });

    // Login to get cookie
    const loginRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/auth/dev/login?email=${encodeURIComponent(user.email)}`,
      method: 'GET'
    });

    if (loginRes.status !== 302 || !loginRes.headers['set-cookie']) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    cookieHeader = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    // ----------------------------------------------------
    // TEST 1: Incomplete Property -> Preview opens successfully
    // ----------------------------------------------------
    console.log('--- TEST 1: Incomplete Property -> Preview opens successfully ---');
    const tokenIncomplete = crypto.randomBytes(24).toString('hex');
    const propIncomplete = await prisma.property.create({
      data: {
        name: 'Incomplete Test Hotel',
        slug: `incomplete-prop-${Date.now()}`,
        ownerId: user.id,
        orgId: org.id,
        previewToken: tokenIncomplete
        // Missing logo, heroImage, receptionPhone, menu, amenities
      }
    });

    const previewResIncomplete = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/preview/${tokenIncomplete}`,
      method: 'GET'
    });

    console.log(`HTTP Status: ${previewResIncomplete.status}`);
    if (previewResIncomplete.status !== 200 || previewResIncomplete.body.property?.name !== 'Incomplete Test Hotel') {
      throw new Error(`TEST 1 FAILED: Expected HTTP 200 with property name, got ${previewResIncomplete.status}`);
    }
    console.log('✅ TEST 1 PASSED: Incomplete property preview opens successfully with HTTP 200\n');

    // ----------------------------------------------------
    // TEST 2: Complete Property -> Preview opens successfully
    // ----------------------------------------------------
    console.log('--- TEST 2: Complete Property -> Preview opens successfully ---');
    const tokenComplete = crypto.randomBytes(24).toString('hex');
    const propComplete = await prisma.property.create({
      data: {
        name: 'Complete Grand Resort',
        slug: `complete-prop-${Date.now()}`,
        ownerId: user.id,
        orgId: org.id,
        logoUrl: 'https://example.com/logo.png',
        heroImage: 'https://example.com/hero.jpg',
        receptionPhone: '+15550199000',
        hotelRules: 'Quiet hours from 10 PM to 7 AM.',
        previewToken: tokenComplete
      }
    });

    const catComplete = await prisma.menuCategory.create({
      data: { propertyId: propComplete.id, name: 'Mains' }
    });

    await prisma.dish.create({
      data: { categoryId: catComplete.id, name: 'Signature Steak', price: 45.00 }
    });

    await prisma.amenity.create({
      data: { propertyId: propComplete.id, name: 'Spa & Sauna' }
    });

    const previewResComplete = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/preview/${tokenComplete}`,
      method: 'GET'
    });

    console.log(`HTTP Status: ${previewResComplete.status}`);
    if (previewResComplete.status !== 200 || previewResComplete.body.property?.dishes?.length !== 1) {
      throw new Error(`TEST 2 FAILED: Expected HTTP 200 with complete menu, got ${previewResComplete.status}`);
    }
    console.log('✅ TEST 2 PASSED: Complete property preview opens successfully with HTTP 200\n');

    // ----------------------------------------------------
    // TEST 3: Complete Property -> Publish works (Creates Snapshot)
    // ----------------------------------------------------
    console.log('--- TEST 3: Complete Property -> Publish works ---');
    const publishRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/manager/properties/${propComplete.slug}/publish`,
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log(`HTTP Status: ${publishRes.status}`);
    if (publishRes.status !== 200) {
      console.log('Publish Error Body:', JSON.stringify(publishRes.body, null, 2));
      throw new Error(`TEST 3 FAILED: Expected 200 OK on publish, got ${publishRes.status}`);
    }

    const snapshotsInDB = await prisma.propertySnapshot.findMany({
      where: { propertyId: propComplete.id }
    });

    console.log(`Snapshots in DB for Complete Property: ${snapshotsInDB.length}`);
    if (snapshotsInDB.length === 0) {
      throw new Error('TEST 3 FAILED: No snapshot created in DB after publishing');
    }
    console.log('✅ TEST 3 PASSED: Publishing complete property creates a published snapshot in DB\n');

    // ----------------------------------------------------
    // TEST 4: Existing preview route behavior remains unchanged
    // ----------------------------------------------------
    console.log('--- TEST 4: Preview route behavior remains unchanged ---');
    const guestDataFromPreview = previewResComplete.body;
    if (
      guestDataFromPreview.token !== 'preview-guest' ||
      guestDataFromPreview.name !== 'Guest (Preview)' ||
      guestDataFromPreview.property?.slug !== propComplete.slug
    ) {
      throw new Error('TEST 4 FAILED: Preview data shape or guest token contract altered');
    }
    console.log('✅ TEST 4 PASSED: Dedicated preview route contract remains 100% intact\n');

    console.log('==================================================');
    console.log('ALL WORKFLOW REGRESSION TESTS PASSED (TESTS 1-4)');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ REGRESSION SUITE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (testUserId) {
      await prisma.propertySnapshot.deleteMany({ where: { property: { ownerId: testUserId } } }).catch(() => {});
      await prisma.dish.deleteMany({ where: { category: { property: { ownerId: testUserId } } } }).catch(() => {});
      await prisma.menuCategory.deleteMany({ where: { property: { ownerId: testUserId } } }).catch(() => {});
      await prisma.amenity.deleteMany({ where: { property: { ownerId: testUserId } } }).catch(() => {});
      await prisma.property.deleteMany({ where: { ownerId: testUserId } }).catch(() => {});
      await prisma.organizationMembership.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runPreviewWorkflowRegressionSuite();
