import React from "react";
import { List, AlertCircle } from "lucide-react";

export type IssuePriority = "Critical" | "High" | "Medium" | "Low";

interface Issue {
  id: number;
  title: string;
  owner: string;
  priority: IssuePriority;
  eta: string;
  guestImpact: "Critical" | "High" | "Medium" | "Low";
  businessImpact: "Critical" | "High" | "Medium" | "Low";
}

const priorityStyle: Record<IssuePriority, string> = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-amber-100 text-amber-700",
  Low:      "bg-surface-hover text-text-secondary opacity-80",
};

const impactDot: Record<string, string> = {
  Critical: "text-red-600",
  High:     "text-orange-500",
  Medium:   "text-amber-500",
  Low:      "text-text-muted",
};

const issues: Issue[] = [
  { id: 1, title: "Guest Wi-Fi degraded",          owner: "IT (Mark)",        priority: "High",     eta: "20 min",   guestImpact: "High",     businessImpact: "Low"      },
  { id: 2, title: "Room 204 not cleared for VIP",  owner: "HK Lead (Priya)", priority: "Critical", eta: "75 min",   guestImpact: "Critical",  businessImpact: "High"     },
  { id: 3, title: "Truffle oil stockout",           owner: "Kitchen (Rosa)",   priority: "High",     eta: "2:00 PM",  guestImpact: "Medium",    businessImpact: "Medium"   },
  { id: 4, title: "Late check-out — Room 116",      owner: "Reception (Sarah)", priority: "Medium",  eta: "1:00 PM",  guestImpact: "Low",       businessImpact: "Low"      },
];

export function IssueQueue() {
  return (
    <div className="rounded-sm border border-divider bg-surface overflow-hidden shadow-premium">
      <div className="px-5 py-4 border-b border-divider bg-background flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List size={16} className="text-text-secondary opacity-60" />
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Issue Queue</span>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">{issues.length} Open</span>
      </div>

      <div className="divide-y divide-gray-100">
        {issues.map(issue => (
          <div key={issue.id} className="px-5 py-4 hover:bg-background transition-colors">
            <div className="flex items-start gap-3">
              <AlertCircle size={15} className={`mt-0.5 flex-shrink-0 ${impactDot[issue.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <p className="text-sm font-semibold text-text-primary">{issue.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-none ${priorityStyle[issue.priority]}`}>
                    {issue.priority}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-text-secondary opacity-60">
                  <span><strong className="text-text-secondary">Owner:</strong> {issue.owner}</span>
                  <span><strong className="text-text-secondary">ETA:</strong> {issue.eta}</span>
                  <span className={impactDot[issue.guestImpact]}><strong className="text-text-secondary mr-0.5">Guest:</strong>{issue.guestImpact}</span>
                  <span className={impactDot[issue.businessImpact]}><strong className="text-text-secondary mr-0.5">Business:</strong>{issue.businessImpact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
