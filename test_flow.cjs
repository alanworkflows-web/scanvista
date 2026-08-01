require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Mock session middleware
app.use((req, res, next) => {
  req.session = { userId: req.headers['x-user-id'] };
  next();
});

// Import the relevant endpoints from server.ts manually to test them
app.post("/api/manager/properties", async (req, res) => {
  try {
    const name = String(req.body.name || 'New Property');
    const slug = name.toLowerCase().replace(/\\s+/g, '-');
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: req.session.userId }
    });
    if (!membership) return res.status(403).json({ error: "User is not part of an organization" });

    const property = await prisma.property.create({
      data: { name, slug: slug + Date.now(), ownerId: req.session.userId, orgId: membership.orgId },
    });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function run() {
  // 1. Create a dummy user like Google Auth would
  const user = await prisma.user.create({
    data: { email: `test-${Date.now()}@example.com`, name: "Test User", role: "MANAGER" }
  });
  console.log("User created:", user.id);

  // 2. Provision org like Google Auth would
  const newOrg = await prisma.organization.create({
    data: { name: "Test Org", slug: `test-org-${Date.now()}` }
  });
  await prisma.organizationMembership.create({
    data: { userId: user.id, orgId: newOrg.id, role: 'OWNER' }
  });
  console.log("Org provisioned.");

  // 3. POST /api/manager/properties
  const res = await request(app)
    .post("/api/manager/properties")
    .set('x-user-id', user.id)
    .send({ name: "My Property" });
  
  console.log("POST /api/manager/properties status:", res.status);
  console.log("POST /api/manager/properties body:", res.body);
}

run().catch(console.error).finally(() => prisma.$disconnect());
