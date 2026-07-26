import React, { useState } from "react";
import { History, X, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStrategy } from "../../../lib/strategyEngine";

export function WhatChangedDigest() {
  const [dismissed, setDismissed] = useState(false);
  const { activeGoal } = useStrategy();

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: "hidden" }}
        transition={{ duration: 0.3 }}
        className="mb-12 rounded-sm bg-gray-900 border border-gray-800 shadow-premium overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2 uppercase tracking-wider">
              <History size={16} className="text-primary-light" /> Since yesterday
            </h3>
            <button 
              onClick={() => setDismissed(true)}
              className="text-text-muted hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {activeGoal === "efficiency" && (
              <>
                <div className="flex items-start gap-3">
                  <TrendingUp size={16} className="text-primary-light mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">Kitchen prep improved by 9 minutes</strong> compared to yesterday morning's baseline.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">Wi-Fi latency is still affecting the terrace.</strong> The ISP escalation from yesterday is pending resolution at 10 AM today.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <History size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">Yesterday's decision:</strong> Approving the morning housekeeping overtime prevented 4 immediate delays.
                  </p>
                </div>
              </>
            )}

            {activeGoal === "revenue" && (
              <>
                <div className="flex items-start gap-3">
                  <TrendingUp size={16} className="text-primary-light mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">Reservations increased by 14%</strong> overnight. Tonight's dinner service is now projected to exceed yesterday's revenue by $1,200.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <History size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">Yesterday's decision:</strong> The recommendation you approved to substitute truffle oil prevented two menu cancellations, protecting $180 in appetizer sales.
                  </p>
                </div>
              </>
            )}

            {activeGoal === "reviews" && (
              <>
                <div className="flex items-start gap-3">
                  <TrendingUp size={16} className="text-primary-light mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">One VIP booking was added</strong> overnight. Room 204 is now flagged for an immediate personal greeting.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <History size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-muted/80">
                    <strong className="text-white">Yesterday's decision:</strong> Your prioritization of Table 8's anniversary resulted in a glowing 5-star review posted at 11:30 PM last night.
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-5 flex justify-end">
             <button 
                onClick={() => setDismissed(true)}
                className="text-xs font-semibold px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-sm transition-colors border border-gray-700"
              >
                Acknowledge & Start Day
              </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
