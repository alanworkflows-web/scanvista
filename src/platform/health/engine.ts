import { MetricQueryOptions } from "../metrics/engine";
import { PlatformMetrics } from "../metrics/platform";
import { AIMetrics } from "../metrics/ai";
import { HospitalityMetrics } from "../metrics/hospitality";

export interface HealthStatus {
  organizationId?: string;
  propertyId?: string;
  score: number;
  status: "Critical" | "At Risk" | "Needs Attention" | "Good" | "Healthy";
  reasons: string[];
  risks: string[];
}

export class HealthEngine {
  
  static async computeHealth(opts: MetricQueryOptions): Promise<HealthStatus> {
    const reasons: string[] = [];
    const risks: string[] = [];
    let score = 50; // Base score

    // Evaluate engagement (Active Users)
    const activeUsers = await PlatformMetrics.getActiveUsers(opts);
    if (activeUsers.value > 0) {
      score += 20;
      reasons.push(`High engagement: ${activeUsers.value} active users this period.`);
    } else {
      score -= 20;
      risks.push("Zero active users detected.");
    }

    // Evaluate AI acceptance
    const acceptance = await AIMetrics.getAcceptanceRate(opts);
    if (acceptance.value > 50) {
      score += 15;
      reasons.push(`Strong AI adoption (${acceptance.value.toFixed(0)}% acceptance).`);
    } else if (acceptance.value > 0) {
      score += 5;
    } else {
      risks.push("No AI recommendations accepted.");
    }

    // Evaluate core usage (Walk Mode)
    const walkMode = await HospitalityMetrics.getWalkModeSessions(opts);
    if (walkMode.value > 0) {
      score += 15;
      reasons.push("Routine Walk Mode usage.");
    } else {
      score -= 10;
      risks.push("Walk Mode usage declining or zero.");
    }

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine status
    let status: HealthStatus["status"];
    if (score >= 80) status = "Healthy";
    else if (score >= 60) status = "Good";
    else if (score >= 40) status = "Needs Attention";
    else if (score >= 20) status = "At Risk";
    else status = "Critical";

    return {
      organizationId: opts.organizationId,
      propertyId: opts.propertyId,
      score,
      status,
      reasons,
      risks
    };
  }
}
