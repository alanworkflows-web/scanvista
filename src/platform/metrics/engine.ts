import { PrismaClient } from "@prisma/client";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subWeeks, subMonths, subYears, format } from "date-fns";

const prisma = new PrismaClient();

export type TimeBucket = "TODAY" | "YESTERDAY" | "7_DAYS" | "30_DAYS" | "90_DAYS" | "YEAR" | "CUSTOM";

export interface MetricQueryOptions {
  organizationId?: string;
  propertyId?: string;
  bucket: TimeBucket;
  customStartDate?: Date;
  customEndDate?: Date;
}

export interface MetricResult {
  value: number;
  previousValue: number;
  trend: number; // percentage change
}

export class MetricsEngine {
  
  static getDateRange(bucket: TimeBucket, customStart?: Date, customEnd?: Date): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
    const now = new Date();
    let start: Date, end: Date, previousStart: Date, previousEnd: Date;

    switch (bucket) {
      case "TODAY":
        start = startOfDay(now);
        end = now;
        previousStart = subDays(start, 1);
        previousEnd = start;
        break;
      case "YESTERDAY":
        start = subDays(startOfDay(now), 1);
        end = startOfDay(now);
        previousStart = subDays(start, 1);
        previousEnd = start;
        break;
      case "7_DAYS":
        start = subDays(now, 7);
        end = now;
        previousStart = subDays(start, 7);
        previousEnd = start;
        break;
      case "30_DAYS":
        start = subDays(now, 30);
        end = now;
        previousStart = subDays(start, 30);
        previousEnd = start;
        break;
      case "90_DAYS":
        start = subDays(now, 90);
        end = now;
        previousStart = subDays(start, 90);
        previousEnd = start;
        break;
      case "YEAR":
        start = subYears(now, 1);
        end = now;
        previousStart = subYears(start, 1);
        previousEnd = start;
        break;
      case "CUSTOM":
        if (!customStart || !customEnd) throw new Error("Custom bucket requires dates");
        start = customStart;
        end = customEnd;
        const diff = end.getTime() - start.getTime();
        previousStart = new Date(start.getTime() - diff);
        previousEnd = start;
        break;
    }
    
    return { start, end, previousStart, previousEnd };
  }

  static calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Helper to query raw events for real-time calculation
  static async countEvents(
    action: any, 
    resourceType: any, 
    opts: MetricQueryOptions
  ): Promise<MetricResult> {
    const { start, end, previousStart, previousEnd } = this.getDateRange(opts.bucket, opts.customStartDate, opts.customEndDate);
    
    const baseWhere = {
      action,
      resourceType,
      ...(opts.organizationId ? { organizationId: opts.organizationId } : {}),
      ...(opts.propertyId ? { propertyId: opts.propertyId } : {})
    };

    const currentCount = await prisma.activityEvent.count({
      where: {
        ...baseWhere,
        timestamp: { gte: start, lte: end }
      }
    });

    const previousCount = await prisma.activityEvent.count({
      where: {
        ...baseWhere,
        timestamp: { gte: previousStart, lt: previousEnd }
      }
    });

    return {
      value: currentCount,
      previousValue: previousCount,
      trend: this.calculateTrend(currentCount, previousCount)
    };
  }
}
