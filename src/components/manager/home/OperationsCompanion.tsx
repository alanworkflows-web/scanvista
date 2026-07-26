import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { businessMemory } from "../../../lib/businessMemory";
import { useStrategy } from "../../../lib/strategyEngine";
import { useRhythm, phaseLabels } from "../../../lib/rhythmEngine";

export function OperationsCompanion() {
  const [expanded, setExpanded] = useState(true); // Open by default for demo
  const { activeGoal } = useStrategy();
  const { currentPhase } = useRhythm();

  const patterns = businessMemory.getTopPatterns(2);

  return (
    <div className="rounded-sm border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white overflow-hidden shadow-premium mb-12">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary-light/20/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-none bg-indigo-100 text-primary-hover">
            <BrainCircuit size={16} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-indigo-900 block">{phaseLabels[currentPhase]}</span>
            <span className="text-xs text-primary-hover/70">Generated at {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-indigo-400" />}
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
            <div className="px-6 pb-6 pt-2 border-t border-indigo-50/50">
              <div className="space-y-4">
                {activeGoal === "efficiency" && (
                  <>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {currentPhase === 'morning_brief' ? "Good morning." : "Operational update:"} Today should be moderately busy with 82 covers expected for lunch.
                    </p>
                    
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Three operational bottlenecks deserve your attention before lunch:
                    </p>
                    <ul className="space-y-1.5 pl-2">
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Housekeeping is forecasting a 40-minute delay without extra support.
                      </li>
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Truffle oil stockout prediction affects two best sellers.
                      </li>
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> VIP arrival at 12:30 PM (Room 204).
                      </li>
                    </ul>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      If these are resolved before 11:30 AM, operational efficiency will remain above target.
                    </p>
                  </>
                )}

                {activeGoal === "reviews" && (
                  <>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {currentPhase === 'morning_brief' ? "Good morning." : "Operational update:"} Today presents excellent opportunities to secure 5-star reviews.
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Three high-impact guest touchpoints require your attention:
                    </p>
                    <ul className="space-y-1.5 pl-2">
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Four guests are celebrating birthdays today. High-probability review targets.
                      </li>
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> VIP check-in (Room 204) at 12:30 PM needs a personal greeting.
                      </li>
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Housekeeping delay could impact early arrivals. Prioritize expediting.
                      </li>
                    </ul>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      Focusing on these moments will maximize your weekly satisfaction score.
                    </p>
                  </>
                )}

                {activeGoal === "revenue" && (
                  <>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {currentPhase === 'morning_brief' ? "Good morning." : "Operational update:"} Today's foot traffic is ideal for maximizing average order value.
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Three revenue-driving decisions require your approval:
                    </p>
                    <ul className="space-y-1.5 pl-2">
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Dinner reservations are 18% above average. Push the new premium seafood specials.
                      </li>
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Truffle oil shortage risks high-margin dishes. Restock immediately.
                      </li>
                      <li className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> Supplier quote for July pricing expires at 18:00.
                      </li>
                    </ul>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      Executing these moves will protect your highest-margin items today.
                    </p>
                  </>
                )}

                {/* Business Memory Integration */}
                <div className="mt-5 bg-primary-light/20/50 rounded-sm p-8 border border-indigo-100">
                  <h4 className="text-xs font-medium text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-500" /> Business Memory
                  </h4>
                  <ul className="space-y-2">
                    {patterns.map(p => (
                      <li key={p.id} className="text-sm text-indigo-800 italic">
                        "{p.observation}"
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-indigo-50 flex items-center justify-between text-xs text-indigo-400">
                <span>AI-generated from live operational data & historical patterns</span>
                <button className="hover:text-primary-hover font-medium transition-colors">Refresh</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
