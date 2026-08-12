const { PrismaClient } = require('@prisma/client');
const http = require('http');
require('dotenv').config();

const prisma = new PrismaClient();

async function runTest() {
  const testId = Date.now();
  const testEmail = `sandbox_e2e_${testId}@example.com`;
  const testSlug = `sandbox-resort-${testId}`;
  
  console.log(`[TEST] 1. Creating Sandbox Property: ${testSlug}`);
  
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Sandbox Tester',
      properties: {
        create: {
          name: 'Sandbox Resort',
          slug: testSlug,
          org: {
            create: {
              name: 'Sandbox Org',
              slug: `sandbox-org-${testId}`
            }
          }
        }
      }
    }
  });

  const property = await prisma.property.findUnique({ where: { slug: testSlug } });
  if (!property) throw new Error("Property not created");

  console.log(`[TEST] 2. Generating Checkout Token for Property ID: ${property.id}`);
  
  // Directly sign a token exactly as the backend would do in checkout-identity
  const jwt = require('jsonwebtoken');
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET || 'test_webhook_secret';
  const checkoutToken = jwt.sign({ slug: testSlug, userId: user.id }, secretKey, { expiresIn: '2h' });
  
  console.log(`[TEST] 3. Simulating Paddle Webhook with strict IDs`);
  
  const eventId = `evt_sandbox_${testId}`;
  const mockPayload = {
    event_id: eventId,
    event_type: 'subscription.activated',
    data: {
      status: 'active',
      customer_id: 'ctm_sandbox123',
      subscription_id: 'sub_sandbox123',
      custom_data: {
        checkoutToken: checkoutToken
      }
    }
  };

  const payloadString = JSON.stringify(mockPayload);
  
  const webhookRes = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/paddle/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'paddle-signature': 'valid' // Bypasses crypto sig because TEST_MODE=true in .env
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(payloadString);
    req.end();
  });

  console.log(`[TEST] Webhook Response: ${webhookRes.status} - ${webhookRes.data}`);

  console.log(`[TEST] 4. Verifying Database State`);
  
  // Wait a brief moment to ensure async processing finishes (though we awaited the response)
  await new Promise(r => setTimeout(r, 500));
  
  const sub = await prisma.subscription.findUnique({ where: { propertyId: property.id } });
  console.log(`[TEST] Subscription Data:`, sub);
  
  const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
  console.log(`[TEST] WebhookEvent Data:`, event);
  
  if (!sub || sub.status !== 'active') {
    throw new Error("Subscription not created or not active");
  }
  if (sub.paddleCustomerId !== 'ctm_sandbox123' || sub.paddleSubscriptionId !== 'sub_sandbox123') {
    throw new Error("Subscription lacks strict Paddle IDs");
  }
  if (!event || event.status !== 'processed') {
    throw new Error("WebhookEvent not recorded or status is not 'processed'");
  }
  
  console.log(`[TEST] PASS: Invariants successfully enforced.`);
  
  console.log(`[TEST] 5. Cleaning up...`);
  await prisma.subscription.deleteMany({ where: { propertyId: property.id } });
  await prisma.property.delete({ where: { id: property.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.webhookEvent.delete({ where: { id: eventId } });
  
  console.log(`[TEST] Cleanup complete.`);
  process.exit(0);
}

runTest().catch(e => {
  console.error("Test Failed:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
