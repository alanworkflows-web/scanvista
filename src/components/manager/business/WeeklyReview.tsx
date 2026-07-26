import React from "react";
import { TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { useStrategy } from "../../../lib/strategyEngine";

export function WeeklyReview() {
  const { activeGoal } = useStrategy();
  return (
    <div className="rounded-sm border border-indigo-100 bg-surface overflow-hidden shadow-premium mb-12">
      <div className="px-6 py-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-medium text-indigo-950">Weekly Business Review</h2>
          <p className="text-sm text-indigo-700/70 mt-0.5">July 10 – July 16</p>
        </div>
        <div className="p-2 rounded-full bg-indigo-100 text-primary-hover hidden sm:block">
          <BookOpen size={20} />
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Column 1 & 2: The Story */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-primary" /> The Story of the Week
          </h3>
          
          <div className="prose prose-indigo max-w-none text-text-secondary leading-relaxed space-y-4">
            {activeGoal === "efficiency" && (
              <>
                <p>
                  This week was quieter than average, closing with a 68% total occupancy. Despite the lower volume, <strong>kitchen prep times were 12% faster</strong> than last month's average.
                </p>
                <p>
                  Your newly introduced shift handover checklist successfully reduced morning friction. Specifically, Saturday lunch generated the fastest order-to-table time of the year (17 mins), proving that the new prep routine is working.
                </p>
                <p>
                  On the operational side, we experienced friction. Wi-Fi degraded 3 times this week, which unfortunately delayed POS transactions. We also saw inventory stockouts on premium items—truffle oil ran low twice, forcing last-minute supplier calls.
                </p>
              </>
            )}
            
            {activeGoal === "reviews" && (
              <>
                <p>
                  This week was quieter than average, closing with a 68% total occupancy. However, <strong>guest satisfaction scores hit an all-time high of 94%</strong>.
                </p>
                <p>
                  Families spent 18% longer dining in the main restaurant during the early evening service, and your newly introduced seafood menu received 12 positive mentions on Google and TripAdvisor.
                </p>
                <p>
                  The only recurring negative feedback stems from Wi-Fi instability. Wi-Fi degraded 3 times this week, leading to 14 minor guest complaints. Resolving this will protect our 5-star streak.
                </p>
              </>
            )}

            {activeGoal === "revenue" && (
              <>
                <p>
                  This week was quieter than average, closing with a 68% total occupancy. However, <strong>average order value increased by $8.50 per table</strong> during the early evening service.
                </p>
                <p>
                  Your newly introduced seafood menu successfully drove high-margin sales. Specifically, Saturday lunch generated the highest gross profit of the month, proving that the premium upselling strategy is working.
                </p>
                <p>
                  On the operational side, inventory stockouts on premium items hurt potential revenue. Truffle oil and specific wines ran low twice, forcing 5 substitutions to lower-margin dishes.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Column 3: Forward Looking Prediction */}
        <div className="lg:border-l lg:border-divider lg:pl-8">
          <h3 className="text-sm font-medium text-indigo-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-500" /> Next Week's Foresight
          </h3>
          
          <div className="bg-primary-light/20 rounded-sm p-8 border border-indigo-100 relative">
            <div className="absolute top-0 right-5 -translate-y-1/2 bg-text-primary text-white hover:bg-text-secondary transition-all shadow-premium text-white text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider shadow-premium">
              Prediction
            </div>
            <p className="text-sm text-indigo-950 leading-relaxed mb-5 mt-2">
              Next week's forecast shows a <strong>15% increase in occupancy</strong> due to the local festival. 
              <br/><br/>
              {activeGoal === "efficiency" && (
                <span>If staffing remains at current baseline, order-to-table times will increase by 8 minutes. <strong>Recommend scheduling 1 extra prep chef for lunch.</strong></span>
              )}
              {activeGoal === "reviews" && (
                <span>The festival brings a surge of first-time visitors. <strong>Recommend scheduling your highest-rated front-of-house staff</strong> to maximize review capture during peak hours.</span>
              )}
              {activeGoal === "revenue" && (
                <span>Festival attendees historically purchase more beverages. <strong>Recommend increasing premium beverage inventory by 20%</strong> to capture high-margin impulse buys.</span>
              )}
            </p>
            <button className="w-full py-2.5 bg-surface border border-indigo-200 hover:bg-text-primary text-white hover:bg-text-secondary transition-all shadow-premium hover:text-white text-indigo-700 text-sm font-semibold rounded-sm transition-colors shadow-premium">
              Adjust Next Week's Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
