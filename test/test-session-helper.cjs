const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

function sign(val, secret) {
  return val + '.' + crypto.createHmac('sha256', secret).update(val).digest('base64').replace(/\=+$/, '');
}

async function testSession() {
  const org = await prisma.organization.create({
    data: { name: 'Test Org', slug: 'test-org-' + Date.now(), currency: 'USD' }
  });
  const user = await prisma.user.create({
    data: { email: 'test-' + Date.now() + '@example.com', name: 'Test User', role: 'OWNER', orgId: org.id }
  });
  const prop = await prisma.property.create({
    data: { name: 'Test Prop', slug: 'test-prop-' + Date.now(), ownerId: user.id, orgId: org.id }
  });

  const sid = crypto.randomBytes(16).toString('hex');
  const sessionData = {
    cookie: {
      originalMaxAge: 30 * 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      secure: false,
      httpOnly: true,
      path: "/",
      sameSite: "lax"
    },
    userId: user.id
  };

  await prisma.session.create({
    data: {
      id: sid,
      sid: sid,
      data: JSON.stringify(sessionData),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // Note: Express session secret comes from process.env.SESSION_SECRET or server.ts fallback
  console.log("Created user:", user.id, "prop:", prop.slug, "sid:", sid);

  // Clean up
  await prisma.session.delete({ where: { sid } });
  await prisma.property.delete({ where: { id: prop.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.organization.delete({ where: { id: org.id } });
  console.log("Cleaned up successfully!");
}

testSession()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
