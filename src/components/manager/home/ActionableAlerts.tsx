import React from "react";
import { ArrowRight, Users, DollarSign, Settings } from "lucide-react";
import { Card } from "../../ui/Card";

type ImpactCategory = "guest" | "revenue" | "operational";

interface Alert {
  id: number;
  title: string;
  desc: string;
  time: string;
  impact: ImpactCategory;
}

const impactConfig: Record<ImpactCategory, { label: string; dot: string; badge: string; icon: React.ReactNode; sort: number }> = {
  guest:       { label: "Guest Impact",       dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border border-red-200",       icon: <Users size={12} />,       sort: 1 },
  revenue:     { label: "Revenue Impact",     dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border border-orange-200", icon: <DollarSign size={12} />, sort: 2 },
  operational: { label: "Operational Impact", dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border border-amber-200",  icon: <Settings size={12} />,    sort: 3 },
};

const rawAlerts: Alert[] = [
  { id: 1, impact: "revenue",     title: "Low Stock Alert",      desc: "Truffle oil and house wine below 15% PAR. Affects 3 menu specials at lunch.",       time: "1 hr ago"  },
  { id: 2, impact: "guest",       title: "VIP Arrival — Rm 204", desc: "Mr. Henderson arriving 12:30 PM. Room not yet cleared. Welcome tray not confirmed.", time: "10 min ago" },
  { id: 3, impact: "operational", title: "Guest Wi-Fi Degraded", desc: "Latency 3× above threshold. ISP routing issue. Estimated fix: 20–40 min.",          time: "2 hrs ago"  },
];

// Sort by guest → revenue → operational
const alerts = [...rawAlerts].sort((a, b) => impactConfig[a.impact].sort - impactConfig[b.impact].sort);

export function ActionableAlerts() {
  return (
    <Card className="p-0 border border-divider shadow-premium bg-surface overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-divider bg-background flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Requires Attention</h2>
        <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">{alerts.length}</span>
      </div>

      <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
        {alerts.map(alert => {
          const cfg = impactConfig[alert.impact];
          return (
            <div key={alert.id} className="p-8 hover:bg-background transition-colors flex gap-3 group cursor-pointer">
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">{alert.title}</p>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-none whitespace-nowrap ${cfg.badge}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-text-secondary opacity-80 leading-relaxed">{alert.desc}</p>
                <p className="text-xs text-text-muted mt-1">{alert.time}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex items-center">
                <ArrowRight size={15} className="text-text-muted" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
