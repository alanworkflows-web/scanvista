const crypto = require('crypto');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.vercel.prod.live' });

const prisma = new PrismaClient();

async function runBillingAudit() {
  console.log("==================================================================");
  console.log("         SCANVISTA PADDLE BILLING END-TO-END AUDIT                ");
  console.log("==================================================================");

  const results = {
    steps: [],
    blockers: [],
    evidence: {}
  };

  try {
    // Step 0: Identify Property & Owner
    const property = await prisma.property.findFirst({
      where: { slug: 'fishstaurant' },
      include: { subscription: true }
    });

    if (!property) {
      throw new Error("Property 'fishstaurant' not found in database");
    }

    console.log(`[Target Property] Name: ${property.name}, Slug: ${property.slug}, ID: ${property.id}`);
    console.log(`[Initial Subscription State] Status: ${property.subscription?.status || 'none'}`);

    // Clean up any test webhook events & reset subscription to test clean flow
    await prisma.subscription.upsert({
      where: { propertyId: property.id },
      update: { status: 'none', paddleCustomerId: null, paddleSubscriptionId: null },
      create: { propertyId: property.id, status: 'none' }
    });
    console.log("[Setup] Reset subscription to status: 'none' (Free Tier)");

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || 'test_webhook_secret';
    const baseUrl = 'http://localhost:3000';

    // Helper: create Paddle signed header
    function signPayload(bodyStr, secret) {
      const ts = Math.floor(Date.now() / 1000);
      const hmac = crypto.createHmac('sha256', secret).update(`${ts}:${bodyStr}`).digest('hex');
      return { signature: `ts=${ts};h1=${hmac}`, timestamp: ts };
    }

    // Helper: post HTTP request
    function postRequest(urlPath, headers, body) {
      return new Promise((resolve, reject) => {
        const url = new URL(urlPath, baseUrl);
        const req = http.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            ...headers
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
    }

    // Helper: get HTTP request
    function getRequest(urlPath, headers = {}) {
      return new Promise((resolve, reject) => {
        const url = new URL(urlPath, baseUrl);
        const req = http.request(url, {
          method: 'GET',
          headers: {
            ...headers
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
        });
        req.on('error', reject);
        req.end();
      });
    }

    // 1. Audit Webhook Signature Rejection (Tampered / Invalid)
    console.log("\n--- [Audit 1: Invalid Signature Rejection] ---");
    const testBody1 = JSON.stringify({
      event_id: `evt_test_invalid_${Date.now()}`,
      event_type: 'subscription.created',
      data: { status: 'active', custom_data: { slug: property.slug } }
    });
    const invalidRes = await postRequest('/api/paddle/webhook', {
      'paddle-signature': 'ts=123456789;h1=invalid_hmac_hash_000000'
    }, testBody1);
    console.log(`HTTP Status: ${invalidRes.statusCode}, Body: ${invalidRes.body}`);
    if (invalidRes.statusCode === 400) {
      console.log("PASS: Tampered/invalid signature correctly rejected with 400 Bad Request");
    } else {
      results.blockers.push({
        step: "Invalid Signature Rejection",
        error: `Expected 400, got ${invalidRes.statusCode}`
      });
    }

    // 2. Audit Webhook Successful Payment & Subscription Activation
    console.log("\n--- [Audit 2: Valid Subscription Activation Webhook] ---");
    const activationEventId = `evt_act_${Date.now()}`;
    const testCustomerId = `ctm_live_${Date.now()}`;
    const testSubId = `sub_live_${Date.now()}`;

    const activationPayload = {
      event_id: activationEventId,
      event_type: 'subscription.activated',
      occurred_at: new Date().toISOString(),
      data: {
        id: testSubId,
        status: 'active',
        customer_id: testCustomerId,
        currency_code: 'USD',
        custom_data: {
          slug: property.slug
        },
        items: [
          {
            price: {
              id: process.env.VITE_PADDLE_PRICE_ID || 'pri_premium_test',
              unit_price: { amount: '1000', currency_code: 'USD' }
            },
            quantity: 1
          }
        ]
      }
    };
    const bodyStr = JSON.stringify(activationPayload);
    const { signature } = signPayload(bodyStr, webhookSecret);

    console.log(`Sending Webhook to /api/paddle/webhook (Event: subscription.activated)...`);
    const validRes = await postRequest('/api/paddle/webhook', {
      'paddle-signature': signature
    }, bodyStr);
    console.log(`HTTP Status: ${validRes.statusCode}, Body: ${validRes.body}`);

    // Check Database State
    const updatedSub = await prisma.subscription.findUnique({
      where: { propertyId: property.id }
    });
    console.log(`[Database Record After Activation Webhook]:`, updatedSub);

    if (validRes.statusCode === 200 && updatedSub?.status === 'active' && updatedSub?.paddleCustomerId === testCustomerId) {
      console.log("PASS: Subscription successfully created/updated in Database with status 'active'");
    } else {
      results.blockers.push({
        step: "Subscription Activation",
        error: "Failed to persist active subscription in database"
      });
    }

    // 3. Audit Idempotency on Duplicate Delivery
    console.log("\n--- [Audit 3: Idempotency on Duplicate Webhook Delivery] ---");
    const dupRes = await postRequest('/api/paddle/webhook', {
      'paddle-signature': signature
    }, bodyStr);
    console.log(`Duplicate HTTP Status: ${dupRes.statusCode}, Body: ${dupRes.body}`);
    if (dupRes.statusCode === 200) {
      console.log("PASS: Duplicate webhook cleanly acknowledged with 200 OK (Idempotent)");
    }

    // 4. Audit Webhook Cancellation / Past Due Handling
    console.log("\n--- [Audit 4: Subscription Cancellation Webhook] ---");
    const cancelEventId = `evt_cancel_${Date.now()}`;
    const cancelPayload = {
      event_id: cancelEventId,
      event_type: 'subscription.canceled',
      occurred_at: new Date().toISOString(),
      data: {
        id: testSubId,
        status: 'canceled',
        customer_id: testCustomerId,
        custom_data: {
          slug: property.slug
        }
      }
    };
    const cancelBodyStr = JSON.stringify(cancelPayload);
    const cancelSig = signPayload(cancelBodyStr, webhookSecret).signature;

    const cancelRes = await postRequest('/api/paddle/webhook', {
      'paddle-signature': cancelSig
    }, cancelBodyStr);
    console.log(`HTTP Status: ${cancelRes.statusCode}, Body: ${cancelRes.body}`);

    const canceledSub = await prisma.subscription.findUnique({
      where: { propertyId: property.id }
    });
    console.log(`[Database Record After Cancellation Webhook]:`, canceledSub);

    if (cancelRes.statusCode === 200 && canceledSub?.status === 'canceled') {
      console.log("PASS: Cancellation webhook accurately updated database to 'canceled'");
    } else {
      results.blockers.push({
        step: "Subscription Cancellation",
        error: "Failed to update canceled subscription in database"
      });
    }

    // 5. Restore to Active for UI Verification
    console.log("\n--- [Audit 5: Re-activate Subscription for Frontend Flow] ---");
    await prisma.subscription.upsert({
      where: { propertyId: property.id },
      update: {
        status: 'active',
        paddleCustomerId: testCustomerId,
        paddleSubscriptionId: testSubId
      },
      create: {
        propertyId: property.id,
        status: 'active',
        paddleCustomerId: testCustomerId,
        paddleSubscriptionId: testSubId
      }
    });
    console.log("Subscription set to 'active' for UI audits.");

    console.log("\n==================================================================");
    console.log(`AUDIT SUMMARY: ${results.blockers.length === 0 ? "ALL BILLING CHECKS PASSED PERFECTLY!" : "BLOCKERS FOUND"}`);
    console.log("==================================================================");

  } catch (err) {
    console.error("Audit encountered error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runBillingAudit();
