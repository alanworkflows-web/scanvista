import { MetricsEngine, MetricQueryOptions, MetricResult } from "./engine";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PlatformMetrics {
  
  static async getTotalOrganizations(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("CREATED", "ORGANIZATION", opts);
  }
  
  static async getTotalProperties(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("CREATED", "PROPERTY", opts);
  }

  static async getActiveUsers(opts: MetricQueryOptions): Promise<MetricResult> {
    // A user is considered active if they triggered any LOGIN event.
    // For distinct count, we query Prisma directly instead of basic countEvents.
    const { start, end, previousStart, previousEnd } = MetricsEngine.getDateRange(opts.bucket, opts.customStartDate, opts.customEndDate);
    
    const baseWhere = {
      action: "LOGIN" as any,
      ...(opts.organizationId ? { organizationId: opts.organizationId } : {}),
      ...(opts.propertyId ? { propertyId: opts.propertyId } : {})
    };

    const currentUniqueActors = await prisma.activityEvent.groupBy({
      by: ['actorId'],
      where: {
        ...baseWhere,
        timestamp: { gte: start, lte: end },
        actorId: { not: null }
      }
    });

    const previousUniqueActors = await prisma.activityEvent.groupBy({
      by: ['actorId'],
      where: {
        ...baseWhere,
        timestamp: { gte: previousStart, lt: previousEnd },
        actorId: { not: null }
      }
    });

    return {
      value: currentUniqueActors.length,
      previousValue: previousUniqueActors.length,
      trend: MetricsEngine.calculateTrend(currentUniqueActors.length, previousUniqueActors.length)
    };
  }
}
