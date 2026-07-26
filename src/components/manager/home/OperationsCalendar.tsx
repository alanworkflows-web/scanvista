import React from "react";
import { Calendar } from "lucide-react";

type EventCategory = "guest" | "operations" | "staff" | "vendor" | "maintenance";

interface HorizonEvent {
  time: string;
  label: string;
  category: EventCategory;
}

const categoryConfig: Record<EventCategory, { label: string; badge: string }> = {
  guest:       { label: "Guest",       badge: "bg-purple-50 text-purple-700 border border-purple-200"  },
  operations:  { label: "Operations",  badge: "bg-amber-50 text-amber-700 border border-amber-200"     },
  staff:       { label: "Staff",       badge: "bg-blue-50 text-blue-700 border border-blue-200"        },
  vendor:      { label: "Vendor",      badge: "bg-teal-50 text-teal-700 border border-teal-200"        },
  maintenance: { label: "Maintenance", badge: "bg-red-50 text-red-700 border border-red-200"           },
};

const horizons: { label: string; sublabel: string; borderColor: string; events: HorizonEvent[] }[] = [
  {
    label: "NOW",
    sublabel: "Next 2 Hours",
    borderColor: "border-red-400",
    events: [
      { time: "10:00", label: "OT approval deadline — Housekeeping",    category: "staff"      },
      { time: "11:30", label: "Lunch prep completion target",            category: "operations" },
      { time: "12:00", label: "VIP welcome tray ready (Mr. Henderson)", category: "guest"      },
    ],
  },
  {
    label: "TODAY",
    sublabel: "Remaining Day",
    borderColor: "border-amber-400",
    events: [
      { time: "12:30", label: "VIP Arrival — Room 204",              category: "guest"      },
      { time: "14:00", label: "Produce delivery — Rajesh Farms",     category: "vendor"     },
      { time: "16:00", label: "Anniversary dinner setup confirm",    category: "guest"      },
      { time: "17:30", label: "AC unit inspection — Rm 301–305",     category: "maintenance"},
      { time: "19:00", label: "Dinner service begins",               category: "operations" },
    ],
  },
  {
    label: "NEXT",
    sublabel: "Tomorrow",
    borderColor: "border-primary/50",
    events: [
      { time: "08:00", label: "8 checkouts + 6 arrivals expected",  category: "guest"   },
      { time: "10:00", label: "Monthly linen supplier visit",       category: "vendor"  },
      { time: "11:00", label: "New staff induction — Front Desk",   category: "staff"   },
    ],
  },
];

export function OperationsCalendar() {
  return (
    <div className="rounded-sm border border-divider bg-surface overflow-hidden shadow-premium">
      <div className="px-5 py-4 border-b border-divider bg-background flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-text-secondary opacity-60" />
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Operations Calendar</span>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2">
          {(["guest", "staff", "vendor"] as EventCategory[]).map(c => (
            <span key={c} className={`text-xs px-1.5 py-0.5 rounded border font-medium ${categoryConfig[c].badge}`}>
              {categoryConfig[c].label}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {horizons.map((h, hi) => (
          <div key={hi} className="px-5 py-4">
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${h.borderColor}`}>
              <span className="text-xs font-black tracking-widest uppercase text-text-secondary">{h.label}</span>
              <span className="text-xs text-text-muted">— {h.sublabel}</span>
            </div>
            <div className="space-y-2.5">
              {h.events.map((e, ei) => {
                const cfg = categoryConfig[e.category];
                return (
                  <div key={ei} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-text-secondary opacity-60 w-10 flex-shrink-0 tabular-nums">{e.time}</span>
                    <span className="text-sm text-text-secondary flex-1 leading-snug">{e.label}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
