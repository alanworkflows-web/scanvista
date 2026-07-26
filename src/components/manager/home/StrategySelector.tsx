import React, { useState } from "react";
import { Target, Star, DollarSign, Clock, ChevronDown, Check } from "lucide-react";
import { useStrategy, BusinessGoal } from "../../../lib/strategyEngine";
import { motion, AnimatePresence } from "framer-motion";

const GOALS = [
  { id: "efficiency", label: "Reduce Friction", icon: Clock, desc: "Focus on speed and operational smoothness." },
  { id: "reviews", label: "Increase Reviews", icon: Star, desc: "Prioritize guest delight and 5-star experiences." },
  { id: "revenue", label: "Maximize Order Value", icon: DollarSign, desc: "Drive upselling and premium item velocity." },
];

export function StrategySelector() {
  const { activeGoal, setActiveGoal } = useStrategy();
  const [open, setOpen] = useState(false);

  const active = GOALS.find(g => g.id === activeGoal) || GOALS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="relative mb-12">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Target size={14} className="text-text-muted" /> Active Strategy
        </span>
        
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-divider rounded-sm shadow-premium hover:border-primary transition-colors"
        >
          <ActiveIcon size={14} className="text-primary-hover" />
          <span className="text-sm font-semibold text-text-primary">{active.label}</span>
          <ChevronDown size={14} className="text-text-muted ml-1" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 w-72 bg-surface border border-divider rounded-sm shadow-premium z-50 overflow-hidden"
            >
              <div className="p-3 bg-background border-b border-divider">
                <p className="text-xs font-semibold text-text-secondary opacity-80">Select Business Objective</p>
                <p className="text-[10px] text-text-secondary opacity-60 leading-snug mt-1">
                  The OS will align all briefing narratives, predictions, and operational recommendations to this goal.
                </p>
              </div>
              <div className="p-2 space-y-1">
                {GOALS.map((g) => {
                  const Icon = g.icon;
                  const isSelected = activeGoal === g.id;
                  
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setActiveGoal(g.id as BusinessGoal);
                        setOpen(false);
                      }}
                      className={`w-full text-left flex items-start gap-3 p-2.5 rounded-sm transition-colors ${
                        isSelected ? "bg-primary-light/20" : "hover:bg-background"
                      }`}
                    >
                      <div className={`mt-0.5 ${isSelected ? "text-primary-hover" : "text-text-muted"}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isSelected ? "text-indigo-900" : "text-text-primary"}`}>
                          {g.label}
                        </p>
                        <p className={`text-xs ${isSelected ? "text-indigo-700/70" : "text-text-secondary opacity-60"}`}>
                          {g.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-primary-hover">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
