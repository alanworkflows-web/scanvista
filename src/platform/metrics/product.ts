import { MetricsEngine, MetricQueryOptions, MetricResult } from "./engine";

export class ProductMetrics {
  
  static async getFeatureAdoption(featureName: string, opts: MetricQueryOptions): Promise<MetricResult> {
    // Feature adoption could be tracked via metadata or specific ActionType
    // Example: ActionType.EXECUTED and metadata.feature = featureName
    return MetricsEngine.countEvents("EXECUTED", "PLAYBOOK", opts); // Stub
  }

  static async getTimeToFirstValue(opts: MetricQueryOptions): Promise<number> {
    // Advanced metric: average time between ORGANIZATION CREATED and first GUEST CHECKED_IN
    // For now, we return a stub.
    return 0; 
  }
}
