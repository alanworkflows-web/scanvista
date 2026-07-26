import React, { useState } from "react";
import { Moon, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStrategy } from "../../../lib/strategyEngine";

export function EndOfDayReview() {
  const [expanded, setExpanded] = useState(false);

  const hour = new Date().getHours();
  // Time gate: only show after 9 PM (or can be forced)
  const isEvening = hour >= 21 || hour < 4; 
  const { activeGoal } = useStrategy();

  if (!isEvening) {
    return null; 
  }

  return (
    <div className="rounded-sm border border-gray-800 bg-gray-900 overflow-hidden shadow-premium mb-12">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-none bg-gray-800 text-text-muted/80">
            <Moon size={16} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-white block">End of Day Debrief</span>
            <span className="text-xs text-text-muted">Review today's performance and prepare handover</span>
          </div>
        </div>
        <div className="text-xs font-semibold px-2 py-1 bg-primary/50/20 text-primary-light rounded">
          {expanded ? "Close" : "Start Review"}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
                
                {/* Wins */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" /> What went well
                  </h4>
                  <ul className="space-y-2">
                    {activeGoal === "efficiency" && (
                      <>
                        <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                          Lunch service cleared 82 covers with zero kitchen bottlenecks.
                        </li>
                        <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                          VIP check-in (Room 204) handled smoothly after morning OT approval.
                        </li>
                      </>
                    )}
                    {activeGoal === "reviews" && (
                      <>
                        <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                          Two birthday tables (including Table 8) left 5-star reviews on Google.
                        </li>
                        <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                          VIP check-in (Room 204) was personally greeted, yielding positive immediate feedback.
                        </li>
                      </>
                    )}
                    {activeGoal === "revenue" && (
                      <>
                        <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                          Premium seafood specials sold out, lifting average order value by 12% for dinner.
                        </li>
                        <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                          Truffle oil emergency restock saved $450 in at-risk appetizer sales.
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Issues */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" /> Unresolved / Handover
                  </h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                      Wi-Fi latency issue escalated to ISP. Expected resolution: Tomorrow 10 AM.
                    </li>
                    <li className="text-sm text-text-muted/80 bg-gray-800/50 p-3 rounded-sm border border-gray-800">
                      Rajesh Farms quote pending review. Reminder set for tomorrow morning.
                    </li>
                  </ul>
                </div>

              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary text-sm font-semibold rounded-sm hover:bg-gray-200 transition-colors"
                >
                  Sign Off Handover <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
