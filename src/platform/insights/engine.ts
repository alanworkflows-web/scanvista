import { HealthEngine, HealthStatus } from "../health/engine";
import { MetricQueryOptions } from "../metrics/engine";
import { PlatformMetrics } from "../metrics/platform";
import { AIMetrics } from "../metrics/ai";
import { HospitalityMetrics } from "../metrics/hospitality";

export interface FounderBrief {
  greeting: string;
  platformHealth: "Healthy" | "Degraded" | "Critical";
  metrics: {
    organizations: number;
    organizationsTrend: number;
    properties: number;
    dailyActiveUsers: number;
    acceptanceRate: number;
  };
  alerts: string[];
  opportunities: string[];
  atRiskCustomers: number;
  narrative: string[];
  aiCompanionMessage: string;
}

export class InsightEngine {

  static async generateFounderBrief(opts: MetricQueryOptions): Promise<FounderBrief> {
    const orgs = await PlatformMetrics.getTotalOrganizations(opts);
    const props = await PlatformMetrics.getTotalProperties(opts);
    const daus = await PlatformMetrics.getActiveUsers(opts);
    const acceptance = await AIMetrics.getAcceptanceRate(opts);
    const walkMode = await HospitalityMetrics.getWalkModeSessions(opts);

    // Normally we'd iterate over all active orgs to compute health.
    // For this engine MVP, we'll simulate an aggregate health check.
    const platformHealthStatus = await HealthEngine.computeHealth(opts);
    
    let platformHealth: FounderBrief["platformHealth"] = "Healthy";
    let atRiskCustomers = 0;
    
    if (platformHealthStatus.status === "Critical" || platformHealthStatus.status === "At Risk") {
      platformHealth = "Degraded";
      atRiskCustomers = 1; // Simulated
    }

    const alerts: string[] = [];
    const opportunities: string[] = [];
    const narrative: string[] = [];
    narrative.push(`Your platform is ${platformHealth.toLowerCase()}.`);

    if (orgs.trend > 0) {
      narrative.push(`${orgs.trend} organization${orgs.trend === 1 ? '' : 's'} expanded usage yesterday.`);
    }

    if (atRiskCustomers > 0) {
      narrative.push(`${atRiskCustomers} propert${atRiskCustomers === 1 ? 'y shows' : 'ies show'} early signs of disengagement.`);
    }

    if (acceptance.value > 70) {
      narrative.push("Recommendation acceptance reached a monthly high.");
    } else if (acceptance.value < 20 && acceptance.previousValue > 0) {
      narrative.push("Recommendation acceptance has dropped significantly.");
    }

    if (walkMode.value === 0) {
      alerts.push("Walk Mode engagement has dropped significantly.");
      opportunities.push("Today's highest-impact action is to follow up with Ocean Breeze Resort regarding Walk Mode usage.");
      narrative.push("Today's highest-impact action is to follow up with Ocean Breeze Resort regarding Walk Mode usage.");
    } else {
      narrative.push("Today's priority is to maintain current operational consistency.");
    }

    let aiCompanionMessage = `Good Morning. ${narrative.join(" ")} ${alerts.join(" ")}`.trim();

    return {
      greeting: "Good Morning, Alan",
      platformHealth,
      metrics: {
        organizations: orgs.value,
        organizationsTrend: orgs.trend,
        properties: props.value,
        dailyActiveUsers: daus.value,
        acceptanceRate: Math.round(acceptance.value)
      },
      alerts,
      opportunities,
      atRiskCustomers,
      narrative,
      aiCompanionMessage
    };
  }
}
