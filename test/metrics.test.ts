import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PlatformMetrics } from "../src/platform/metrics/platform";
import { AIMetrics } from "../src/platform/metrics/ai";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

describe("Metrics Engine", () => {
  let orgId: string;
  let propertyId: string;

  beforeAll(async () => {
    // Setup test organization and property
    const org = await prisma.organization.create({
      data: { name: "Metrics Org", slug: `metrics-org-${Date.now()}` }
    });
    orgId = org.id;

    const user = await prisma.user.create({ data: { email: `test-${Date.now()}@test.com`, name: "Test" } });
    
    const prop = await prisma.property.create({
      data: { name: "Metrics Prop", slug: `metrics-prop-${Date.now()}`, orgId: org.id, ownerId: user.id }
    });
    propertyId = prop.id;

    const now = new Date();
    
    // Seed some events for TODAY
    await prisma.activityEvent.createMany({
      data: [
        {
          organizationId: orgId,
          propertyId,
          resourceType: "RECOMMENDATION",
          action: "GENERATED",
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

    // Seed some events for YESTERDAY
    const yesterday = subDays(now, 1);
    await prisma.activityEvent.createMany({
      data: [
        {
          organizationId: orgId,
          propertyId,
          resourceType: "RECOMMENDATION",
          action: "GENERATED",
          timestamp: yesterday
        },
        {
          organizationId: orgId,
          propertyId,
          resourceType: "RECOMMENDATION",
          action: "VIEWED",
          timestamp: yesterday
        }
      ]
    });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("calculates basic counts for TODAY", async () => {
    const res = await AIMetrics.getRecommendationsGenerated({ bucket: "TODAY", organizationId: orgId });
    expect(res.value).toBeGreaterThanOrEqual(1);
    // previousValue should be the count from YESTERDAY (at least 1)
    expect(res.previousValue).toBeGreaterThanOrEqual(1);
  }, 30000);

  it("calculates complex conversion rates", async () => {
    const res = await AIMetrics.getAcceptanceRate({ bucket: "TODAY", organizationId: orgId });
    // We seeded 1 VIEWED and 1 ACCEPTED today, so rate should be 100%
    expect(res.value).toBe(100);
    
    // We seeded 1 VIEWED and 0 ACCEPTED yesterday, so rate should be 0%
    expect(res.previousValue).toBe(0);
  }, 30000);
});
