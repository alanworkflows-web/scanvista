import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, Check, X, History } from "lucide-react";
import { decisionMemory, DecisionOutcome } from "../../../lib/decisionMemory";

interface PendingDecision {
  id: number;
  title: string;
  context: string;
  deadline: string;
  urgency: "urgent" | "today" | "low";
  confidence: number;
  because: string;
  decisionId: string;
}

const urgencyStyle = {
  urgent: { bar: "bg-red-500",   badge: "bg-red-50 text-red-700 border border-red-200"   },
  today:  { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  low:    { bar: "bg-gray-300",  badge: "bg-surface-hover text-text-secondary opacity-80 border border-divider"  },
};

const decisions: PendingDecision[] = [
  {
    id: 1,
    title: "Approve staff overtime",
    context: "3 housekeeping staff need OT to clear VIP and early check-in rooms before 12:30 PM.",
    deadline: "Before 10:00 AM",
    urgency: "urgent",
    confidence: 97,
    because: "2 confirmed VIP arrivals. Room 204 not cleared.",
    decisionId: "ot-housekeeping-vip",
  },
  {
    id: 2,
    title: "Accept supplier produce quote",
    context: "Rajesh Farms submitted July 17 pricing. Quote expires today at 6 PM.",
    deadline: "Before 6:00 PM",
    urgency: "today",
    confidence: 78,
    because: "Previous quote was 12% cheaper. Recommend comparison first.",
    decisionId: "supplier-quote-july",
  },
  {
    id: 3,
    title: "Confirm anniversary dinner setup",
    context: "Table 8 romantic setup for a 7 PM booking. Requires florals and candle approval.",
    deadline: "Before 4:00 PM",
    urgency: "today",
    confidence: 92,
    because: "Guest explicitly requested candlelight. Booking notes confirmed.",
    decisionId: "anniversary-dinner",
  },
];

function ConfidencePill({ value }: { value: number }) {
  const color = value >= 90 ? "text-text-primary bg-primary/5 border-divider"
              : value >= 70 ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-none border whitespace-nowrap ${color}`}>
      {value}% confident
    </span>
  );
}

export function PendingDecisions() {
  const [activeDecisions, setActiveDecisions] = useState(decisions);
  const [memories, setMemories] = useState<Record<string, any>>({});

  useEffect(() => {
    const newMemories: Record<string, any> = {};
    activeDecisions.forEach(d => {
      const past = decisionMemory.getPastOutcome(d.decisionId);
      if (past) newMemories[d.decisionId] = past;
    });
    setMemories(newMemories);
  }, [activeDecisions]);

  const handleAction = (id: number, decisionId: string, outcome: DecisionOutcome) => {
    decisionMemory.record(decisionId, outcome);
    setActiveDecisions(prev => prev.filter(d => d.id !== id));
  };

  if (activeDecisions.length === 0) {
    return (
      <div className="rounded-sm border border-divider bg-surface overflow-hidden shadow-premium flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
          <Check size={24} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-text-primary">All caught up</p>
        <p className="text-xs text-text-secondary opacity-60 mt-1">No pending decisions require your attention.</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-divider bg-surface overflow-hidden shadow-premium">
      <div className="px-5 py-4 border-b border-divider bg-background flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-text-secondary opacity-60" />
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Pending Decisions</span>
        </div>
        <span className="text-xs text-text-secondary opacity-60">{activeDecisions.length} awaiting you</span>
      </div>

      <div className="divide-y divide-gray-100">
        {activeDecisions.map(d => {
          const s = urgencyStyle[d.urgency];
          return (
            <div key={d.id} className="flex gap-0 hover:bg-background transition-colors">
              <div className={`w-1 flex-shrink-0 ${s.bar}`} />
              <div className="flex-1 px-5 py-4">
                {/* Row 1: title + deadline */}
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <p className="text-sm font-semibold text-text-primary">{d.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-none whitespace-nowrap ${s.badge}`}>
                    {d.deadline}
                  </span>
                </div>

                {/* Context */}
                <p className="text-xs text-text-secondary opacity-60 leading-relaxed mb-3">{d.context}</p>

                {/* Confidence + Because */}
                <div className="flex items-start gap-2 flex-wrap mb-4">
                  <ConfidencePill value={d.confidence} />
                  <p className="text-xs text-text-secondary opacity-60 italic">
                    <span className="text-text-secondary not-italic font-medium">Because: </span>
                    {d.because}
                  </p>
                </div>

                {/* Memory Context */}
                {memories[d.decisionId] && (
                  <div className="mb-4 flex items-start gap-2 text-xs text-indigo-800 bg-primary-light/20 border border-indigo-100 rounded-sm px-3 py-2">
                    <History size={13} className="mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Decision Memory:</strong> Last time you <strong>{memories[d.decisionId].outcome}</strong> a similar request.
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => handleAction(d.id, d.decisionId, "approved")}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white shadow-premium-hover transition-all hover:bg-emerald-700 text-white text-xs font-semibold rounded-sm transition-colors"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(d.id, d.decisionId, "dismissed")}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-hover hover:bg-gray-200 text-text-secondary text-xs font-semibold rounded-sm transition-colors"
                  >
                    <X size={14} /> Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-background border-t border-divider">
        <p className="text-xs text-text-muted flex items-center gap-1">
          <AlertCircle size={12} /> Confidence scores are advisory. All decisions require your approval.
        </p>
      </div>
    </div>
  );
}
