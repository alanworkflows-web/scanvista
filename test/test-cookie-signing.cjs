const cookieSignature = require('cookie-signature');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const sessionSecret = process.env.SESSION_SECRET;
console.log("Session Secret found in .env:", !!sessionSecret);

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function testAuth() {
  const user = await prisma.user.findFirst({ where: { email: 'alanworkflows@gmail.com' } });
  const property = await prisma.property.findUnique({ where: { slug: 'fishstaurant' } });

  console.log(`User: ${user.name} (${user.id}) | Property: ${property.name} (${property.id})`);

  // Create or update active session in Neon DB
  const sid = "alan-prod-verification-session-2026";
  const sessionData = JSON.stringify({
    cookie: {
      originalMaxAge: 2592000000,
      expires: new Date(Date.now() + 2592000000).toISOString(),
      secure: true,
      httpOnly: true,
      path: "/",
      sameSite: "lax"
    },
    userId: user.id,
    currentPropertyId: property.id
  });

  await prisma.session.upsert({
    where: { sid: sid },
    update: {
      data: sessionData,
      expiresAt: new Date(Date.now() + 2592000000)
    },
    create: {
      id: sid,
      sid: sid,
      data: sessionData,
      expiresAt: new Date(Date.now() + 2592000000)
    }
  });

  const signedCookieValue = 's:' + cookieSignature.sign(sid, sessionSecret);
  console.log("Signed Cookie:", signedCookieValue);

  // Test fetch to https://scanvista.vercel.app/api/me with signed cookie
  const res = await fetch('https://scanvista.vercel.app/api/me', {
    headers: {
      'Cookie': `connect.sid=${encodeURIComponent(signedCookieValue)}`
    }
  });

  console.log("Fetch /api/me Status:", res.status);
  const json = await res.json();
  console.log("Fetch /api/me Response Body:", json);

  // Test fetch /api/manager/current-property
  const propRes = await fetch('https://scanvista.vercel.app/api/manager/current-property', {
    headers: {
      'Cookie': `connect.sid=${encodeURIComponent(signedCookieValue)}`
    }
  });
  console.log("Fetch /api/manager/current-property Status:", propRes.status);
  const propJson = await propRes.json();
  console.log("Fetch /api/manager/current-property Data:", propJson);

  await prisma.$disconnect();
}

testAuth();
