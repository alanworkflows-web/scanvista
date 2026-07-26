import React from "react";
import { BarChart2 } from "lucide-react";

interface ServiceCapacity {
  label: string;
  service: string;
  expected: number;
  capacity: number;
  unit: string;
  staffStatus: "Ready" | "Understaffed" | "Over-deployed";
  recommendation: string;
}

const services: ServiceCapacity[] = [
  { label: "Lunch",  service: "Restaurant",  expected: 82,  capacity: 100, unit: "covers", staffStatus: "Ready",         recommendation: "Normal preparation. No action needed." },
  { label: "Check-in Rush", service: "Reception", expected: 12, capacity: 20, unit: "guests", staffStatus: "Ready",        recommendation: "Adequate. Monitor if walk-ins spike above 8." },
  { label: "Turnover", service: "Housekeeping", expected: 16, capacity: 24, unit: "rooms", staffStatus: "Understaffed", recommendation: "2 staff short. Approve overtime or adjust priority order." },
];

function CapacityBar({ value, max, staffStatus }: { value: number; max: number; staffStatus: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = staffStatus === "Understaffed" ? "bg-amber-500" : pct > 85 ? "bg-orange-500" : "bg-primary/50";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-hover rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-text-secondary w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

export function OperationalCapacity() {
  return (
    <div className="rounded-sm border border-divider bg-surface overflow-hidden shadow-premium">
      <div className="px-5 py-4 border-b border-divider bg-background flex items-center gap-2">
        <BarChart2 size={16} className="text-text-secondary opacity-60" />
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Operational Capacity</span>
      </div>

      <div className="divide-y divide-gray-100">
        {services.map((s, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-text-primary">{s.label}</span>
                <span className="text-xs text-text-muted ml-2">{s.service}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-none ${
                s.staffStatus === "Understaffed" ? "bg-amber-50 text-amber-700" :
                s.staffStatus === "Over-deployed" ? "bg-red-50 text-red-700" :
                "bg-primary/5 text-text-primary"
              }`}>
                Staff: {s.staffStatus}
              </span>
            </div>
            <CapacityBar value={s.expected} max={s.capacity} staffStatus={s.staffStatus} />
            <p className="text-xs text-text-secondary opacity-60 mt-2">
              Expected <strong>{s.expected}</strong> {s.unit} · Capacity <strong>{s.capacity}</strong> {s.unit}
            </p>
            <p className="text-xs text-blue-700 bg-blue-50 rounded-none px-2 py-1 mt-2 border border-blue-100">
              → {s.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
