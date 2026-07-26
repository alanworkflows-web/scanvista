import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { HealthEngine } from "../src/platform/health/engine";

const prisma = new PrismaClient();

describe("Health Engine", () => {
  let orgId: string;
  let propertyId: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test organization and property
    const user = await prisma.user.create({ data: { email: `health-${Date.now()}@test.com`, name: "Health Test" } });
    userId = user.id;

    const org = await prisma.organization.create({
      data: { name: "Health Org", slug: `health-org-${Date.now()}` }
    });
    orgId = org.id;

    const prop = await prisma.property.create({
      data: { name: "Health Prop", slug: `health-prop-${Date.now()}`, orgId: org.id, ownerId: user.id }
    });
    propertyId = prop.id;

    const now = new Date();

    // Seed events for healthy signals
    await prisma.activityEvent.createMany({
      data: [
        {
          organizationId: orgId,
          propertyId,
          actorId: userId,
          resourceType: "STAFF",
          action: "LOGIN",
          timestamp: now
        },
        {
          organizationId: orgId,
          propertyId,
          resourceType: "RECOMMENDATION",
          action: "VIEWED",
          timestamp: now
        },
        {
          organizationId: orgId,
          propertyId,
          resourceType: "RECOMMENDATION",
          action: "ACCEPTED",
          timestamp: now
        },
        {
          organizationId: orgId,
          propertyId,
          resourceType: "PLAYBOOK",
          action: "EXECUTED",
          timestamp: now
        }
      ]
    });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("calculates a high health score based on positive engagement", async () => {
    const status = await HealthEngine.computeHealth({ bucket: "TODAY", organizationId: orgId });
    
    // We expect:
    // Base 50
    // +20 for active user
    // +15 for high AI acceptance
    // +15 for Walk Mode (Playbook Executed)
    // Total = 100
    expect(status.score).toBeGreaterThan(80);
    expect(status.status).toBe("Healthy");
    expect(status.reasons.length).toBeGreaterThan(0);
    expect(status.risks.length).toBe(0);
  }, 30000);
});
