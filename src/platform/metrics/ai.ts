import { MetricsEngine, MetricQueryOptions, MetricResult } from "./engine";

export class AIMetrics {
  
  static async getRecommendationsGenerated(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("GENERATED", "RECOMMENDATION", opts);
  }

  static async getRecommendationsViewed(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("VIEWED", "RECOMMENDATION", opts);
  }

  static async getRecommendationsAccepted(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("ACCEPTED", "RECOMMENDATION", opts);
  }

  static async getRecommendationsDismissed(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("DISMISSED", "RECOMMENDATION", opts);
  }

  static async getRecommendationsExecuted(opts: MetricQueryOptions): Promise<MetricResult> {
    return MetricsEngine.countEvents("EXECUTED", "RECOMMENDATION", opts);
  }

  static async getAcceptanceRate(opts: MetricQueryOptions): Promise<{ value: number; previousValue: number }> {
    const accepted = await this.getRecommendationsAccepted(opts);
    const viewed = await this.getRecommendationsViewed(opts);

    const calcRate = (a: number, v: number) => (v === 0 ? 0 : (a / v) * 100);

    return {
      value: calcRate(accepted.value, viewed.value),
      previousValue: calcRate(accepted.previousValue, viewed.previousValue)
    };
  }
}
