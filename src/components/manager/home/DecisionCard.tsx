import React, { useState } from "react";
import { AlertTriangle, ChevronRight, Info, HelpCircle, ChevronDown, ChevronUp, FastForward } from "lucide-react";

export type ReadinessStatus = "ready" | "warning" | "critical";

export interface Dependency {
  department: string;
  status: "ready" | "warning" | "blocked";
}

export interface DecisionCardProps {
  title: string;
  icon: React.ReactNode;
  status: ReadinessStatus;
  facts: { label: string; value: string }[];
  risk?: string;
  recommendation?: string;
  impact?: string;
  prediction?: string;
  evidence?: string[];
  dependencies?: Dependency[];
  responsibility?: string;
  executionState?: "pending" | "approved" | "executing" | "outcome";
  playbookContext?: string;
  onDrillDown?: () => void;
}

const statusConfig: Record<ReadinessStatus, { bg: string; border: string; badge: string; badgeText: string; dot: string }> = {
  ready:    { bg: "bg-surface",        border: "border-divider",  badge: "bg-primary/5 text-text-primary border-divider", badgeText: "Ready",   dot: "bg-primary/50" },
  warning:  { bg: "bg-amber-50/30",  border: "border-amber-200", badge: "bg-amber-50 text-amber-700 border-amber-200",   badgeText: "Attention", dot: "bg-amber-500"  },
  critical: { bg: "bg-red-50/30",    border: "border-red-200",   badge: "bg-red-50 text-red-700 border-red-200",       badgeText: "Critical",  dot: "bg-red-500"    },
};

const depColors: Record<string, string> = {
  ready:   "text-primary bg-primary/5",
  warning: "text-amber-600 bg-amber-50",
  blocked: "text-red-600 bg-red-50",
};
const depSymbols: Record<string, string> = { ready: "✓", warning: "⚠", blocked: "✗" };

export function DecisionCard({ title, icon, status, facts, risk, recommendation, impact, prediction, evidence, dependencies, responsibility, executionState, playbookContext, onDrillDown }: DecisionCardProps) {
  const cfg = statusConfig[status];
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <div className={`rounded-sm border ${cfg.border} ${cfg.bg} p-8 flex flex-col gap-10 transition-shadow hover:shadow-premium-hover`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="text-text-secondary opacity-60">{icon}</div>
          <span className="font-semibold text-text-primary text-sm leading-tight">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-none border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.badgeText}
          </span>
          {onDrillDown && (
            <button onClick={onDrillDown} className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-secondary transition-colors">
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Facts */}
      <div className="grid grid-cols-2 gap-2">
        {facts.map((f, i) => (
          <div key={i} className="bg-surface/70 rounded-sm p-2.5 border border-divider">
            <p className="text-xs text-text-secondary opacity-60 mb-0.5">{f.label}</p>
            <p className="text-sm font-medium text-text-primary">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Cross-dept Dependencies */}
      {dependencies && dependencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dependencies.map((d, i) => (
            <span key={i} className={`text-xs font-semibold px-2 py-0.5 rounded-none ${depColors[d.status]}`}>
              {depSymbols[d.status]} {d.department}
            </span>
          ))}
        </div>
      )}

      {/* Risk + Recommendation */}
      {(risk || recommendation) && (
        <div className="space-y-2">
          {risk && (
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-sm px-3 py-2">
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
              <span><strong>Risk:</strong> {risk}</span>
            </div>
          )}
          {prediction && (
            <div className="flex items-start gap-2 text-xs text-indigo-800 bg-primary-light/20 border border-indigo-100 rounded-sm px-3 py-2">
              <FastForward size={13} className="mt-0.5 flex-shrink-0 text-indigo-500" />
              <span><strong>Prediction:</strong> {prediction}</span>
            </div>
          )}
          {recommendation && (
            <div className="flex flex-col text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-sm overflow-hidden">
              <div className="flex items-start gap-2 px-3 py-2">
                <Info size={13} className="mt-0.5 flex-shrink-0" />
                <span><strong>Recommended:</strong> {recommendation}</span>
              </div>
              
              {/* Evidence Section */}
              {evidence && evidence.length > 0 && (
                <div className="border-t border-blue-100/50">
                  <button 
                    onClick={() => setEvidenceOpen(!evidenceOpen)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold hover:bg-blue-100/50 transition-colors text-blue-600"
                  >
                    <span className="flex items-center gap-1.5"><HelpCircle size={10} /> Why am I seeing this?</span>
                    {evidenceOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  
                  {evidenceOpen && (
                    <div className="px-3 py-2 bg-surface/40">
                      <ul className="space-y-1">
                        {evidence.map((ev, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-blue-900 leading-snug">
                            <span className="text-blue-400 mt-0.5">•</span> {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contextual Knowledge Engine Injection */}
          {playbookContext && (
            <div className="flex items-start gap-2 px-3 py-2 bg-primary-light/20/50 border border-indigo-100 rounded-sm">
              <div className="w-5 h-5 rounded-none bg-indigo-100 text-primary-hover flex items-center justify-center shrink-0">
                <span className="text-[10px] font-medium">BP</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wider mb-0.5 block">Playbook</span>
                <p className="text-xs text-indigo-900 font-medium leading-snug">{playbookContext}</p>
              </div>
            </div>
          )}
          
          {/* Responsibility & Execution State */}
          {responsibility && executionState && (
            <div className="flex flex-col text-[10px] uppercase tracking-wider font-semibold bg-background border border-divider rounded-sm p-2 mt-2">
              <div className="flex items-center justify-between text-text-secondary opacity-60 mb-1.5 px-1">
                <span>Responsibility</span>
                <span className="text-text-primary">{responsibility}</span>
              </div>
              <div className="flex items-center gap-1.5 w-full">
                <div className={`flex-1 h-1.5 rounded-full ${['approved', 'executing', 'outcome'].includes(executionState) ? 'bg-primary-light/200' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-1.5 rounded-full ${['executing', 'outcome'].includes(executionState) ? 'bg-primary-light/200' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-1.5 rounded-full ${executionState === 'outcome' ? 'bg-primary/50' : 'bg-gray-200'}`} />
              </div>
              <div className="flex justify-between text-[9px] text-text-muted mt-1 px-1">
                <span className={['approved', 'executing', 'outcome'].includes(executionState) ? 'text-primary-hover' : ''}>Approved</span>
                <span className={['executing', 'outcome'].includes(executionState) ? 'text-primary-hover' : ''}>Executing</span>
                <span className={executionState === 'outcome' ? 'text-primary' : ''}>Outcome</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Impact */}
      {impact && (
        <p className="text-xs text-text-secondary opacity-60 italic border-t border-divider pt-2">
          Impact if delayed: {impact}
        </p>
      )}
    </div>
  );
}
