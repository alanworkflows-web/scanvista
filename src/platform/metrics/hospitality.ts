import { MetricsEngine, MetricQueryOptions, MetricResult } from "./engine";

export class HospitalityMetrics {
  
  static async getGuestCheckIns(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("CHECKED_IN", "GUEST", opts);
  }

  static async getGuestCheckOuts(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("CHECKED_OUT", "GUEST", opts);
  }

  static async getWalkModeSessions(opts: MetricQueryOptions): Promise<MetricResult> {
    // Requires a new resource type or generic metadata check, 
    // assuming VIEWED PLAYBOOK or similar for Walk Mode
    return MetricsEngine.countEvents("EXECUTED", "PLAYBOOK", opts);
  }

  static async getTasksCompleted(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("EXECUTED", "STAFF", opts); // Example mapping
  }
}
