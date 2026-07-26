import React, { useState } from "react";
import { GitBranch, ChevronDown, ChevronUp } from "lucide-react";

interface ChainNode {
  department: string;
  status: "blocked" | "warning" | "ready";
  detail: string;
}

interface DependencyChainProps {
  trigger: string;
  nodes: ChainNode[];
  outcome: { label: string; severity: "low" | "medium" | "high" };
}

const nodeStyle: Record<ChainNode["status"], { dot: string; line: string; text: string }> = {
  blocked: { dot: "bg-red-500 border-red-300",    line: "border-red-200",    text: "text-red-700"  },
  warning: { dot: "bg-amber-400 border-amber-300", line: "border-amber-200",  text: "text-amber-700"},
  ready:   { dot: "bg-primary/50 border-emerald-300", line: "border-divider", text: "text-text-primary" },
};

const outcomeColor = { low: "bg-amber-50 border-amber-200 text-amber-800", medium: "bg-orange-50 border-orange-200 text-orange-800", high: "bg-red-50 border-red-200 text-red-800" };

const vipChain: DependencyChainProps = {
  trigger: "Room 204 — Not cleared for VIP arrival (12:30 PM)",
  nodes: [
    { department: "Housekeeping", status: "blocked", detail: "2 staff short. Room 204 behind schedule by ~90 min." },
    { department: "Reception",    status: "warning", detail: "Cannot assign room key or initiate check-in sequence." },
    { department: "Kitchen",      status: "warning", detail: "Welcome drink prep stalled — no room confirmed to deliver to." },
  ],
  outcome: { label: "VIP satisfaction risk — Complaint probability: 32% if unresolved before 12:15 PM.", severity: "high" },
};

function Chain({ trigger, nodes, outcome }: DependencyChainProps) {
  return (
    <div className="space-y-0">
      {/* Trigger */}
      <div className="flex items-start gap-3 mb-1">
        <div className="flex flex-col items-center gap-0 mt-1">
          <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-red-300 flex-shrink-0" />
          <div className="w-0.5 h-5 bg-red-200" />
        </div>
        <p className="text-sm font-semibold text-red-800 pt-0.5">{trigger}</p>
      </div>

      {/* Chain nodes */}
      {nodes.map((node, i) => {
        const s = nodeStyle[node.status];
        const isLast = i === nodes.length - 1;
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-0 mt-1">
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${s.dot}`} />
              {!isLast && <div className={`w-0.5 h-5 border-l-2 ${s.line}`} />}
            </div>
            <div className="pb-2">
              <span className={`text-xs font-medium uppercase tracking-wide ${s.text}`}>{node.department}</span>
              <p className="text-xs text-text-secondary opacity-80 leading-relaxed">{node.detail}</p>
            </div>
          </div>
        );
      })}

      {/* Outcome */}
      <div className={`ml-6 mt-2 rounded-sm border px-3 py-2 ${outcomeColor[outcome.severity]}`}>
        <p className="text-xs font-semibold">{outcome.label}</p>
      </div>
    </div>
  );
}

export function DependencyChain() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-sm border border-divider bg-surface overflow-hidden shadow-premium">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-5 py-4 border-b border-divider bg-background flex items-center justify-between hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitBranch size={15} className="text-text-secondary opacity-60" />
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Cross-Department Chain</span>
          <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">1 Active</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>

      {expanded && (
        <div className="px-5 py-5">
          <p className="text-xs text-text-muted mb-4 italic">
            One issue is propagating across departments. Resolving at the source resolves all downstream.
          </p>
          <Chain {...vipChain} />
        </div>
      )}
    </div>
  );
}
