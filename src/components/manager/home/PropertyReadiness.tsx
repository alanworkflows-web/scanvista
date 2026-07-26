import React from "react";
import { CheckCircle2, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "../../ui/Card";

// Mock health data — will connect to real metrics later
const health = {
  score: 92,
  label: "Operational",
  trend: "up",
  trendLabel: "Better than yesterday",
  nextRisk: "Lunch preparation",
  openIssues: 4,
};

export function PropertyReadiness() {
  const isHealthy = health.score >= 80;
  const isCritical = health.score < 60;

  const scoreColor = isCritical
    ? "text-red-600"
    : isHealthy
    ? "text-primary"
    : "text-amber-600";

  const ringColor = isCritical
    ? "stroke-red-500"
    : isHealthy
    ? "stroke-emerald-500"
    : "stroke-amber-500";

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.score / 100) * circumference;

  return (
    <Card className="p-8 border border-divider shadow-premium bg-surface">
      <div className="flex items-start justify-between gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-text-secondary opacity-60 uppercase tracking-wider">
              Today's Health
            </h2>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none text-xs font-semibold border ${
                isHealthy
                  ? "bg-primary/5 text-text-primary border-divider"
                  : isCritical
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isHealthy ? "bg-primary/50" : isCritical ? "bg-red-500" : "bg-amber-500"}`} />
              {health.label}
            </span>
          </div>

          <div className="flex items-end gap-3 mb-3">
            {/* Circular score */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={radius} strokeWidth="6" fill="none" className="stroke-gray-100" />
                <circle
                  cx="35" cy="35" r={radius} strokeWidth="6" fill="none"
                  className={`${ringColor} transition-all duration-700`}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-black ${scoreColor}`}>{health.score}</span>
              </div>
            </div>

            <div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${isHealthy ? "text-primary" : "text-amber-600"} mb-1`}>
                <TrendingUp size={14} />
                {health.trendLabel}
              </div>
              <p className="text-xs text-text-secondary opacity-60">
                <span className="font-medium text-text-secondary">Next risk:</span> {health.nextRisk}
              </p>
              <p className="text-xs text-text-secondary opacity-60 mt-0.5">
                <span className="font-medium text-text-secondary">{health.openIssues}</span> open issues
              </p>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-full ${isHealthy ? "bg-primary-light/20 text-primary" : "bg-amber-100 text-amber-600"}`}>
          {isHealthy ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
        </div>
      </div>

      <div className="pt-4 border-t border-divider flex items-center justify-between text-xs text-text-secondary opacity-60">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} /> System check verified
        </span>
        <span>Updated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </Card>
  );
}
