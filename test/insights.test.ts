import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { InsightEngine } from "../src/platform/insights/engine";

const prisma = new PrismaClient();

describe("Insight Engine", () => {
  let orgId: string;
  let propertyId: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test organization and property
    const user = await prisma.user.create({ data: { email: `insight-${Date.now()}@test.com`, name: "Insight Test" } });
    userId = user.id;

    const org = await prisma.organization.create({
      data: { name: "Insight Org", slug: `insight-org-${Date.now()}` }
    });
    orgId = org.id;

    const prop = await prisma.property.create({
      data: { name: "Insight Prop", slug: `insight-prop-${Date.now()}`, orgId: org.id, ownerId: user.id }
    });
    propertyId = prop.id;

    const now = new Date();

    // Seed events
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
        }
      ]
    });
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("generates a Founder Brief based on current metrics", async () => {
    const brief = await InsightEngine.generateFounderBrief({ bucket: "TODAY", organizationId: orgId });
    
    expect(brief.greeting).toContain("Good Morning");
    expect(brief.metrics.dailyActiveUsers).toBeGreaterThanOrEqual(1);
    expect(brief.metrics.acceptanceRate).toBe(100);
    // Since walk mode wasn't executed for this org, we expect an alert and a risk
    expect(brief.alerts.length).toBeGreaterThanOrEqual(1);
    expect(brief.opportunities.length).toBeGreaterThanOrEqual(1);
    expect(brief.aiCompanionMessage).toContain("Good Morning");
    expect(brief.aiCompanionMessage).toContain("Walk Mode engagement has dropped significantly.");
  }, 60000);
});
