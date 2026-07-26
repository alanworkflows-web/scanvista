import React from "react";
import { CheckCircle2, Clock, MapPin, ArrowDown, UserPlus, Sparkles, ChefHat } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineEvent {
  id: string;
  time: string;
  department: string;
  action: string;
  status: "completed" | "current" | "upcoming";
  icon: React.ReactNode;
}

const events: TimelineEvent[] = [
  {
    id: "e1",
    time: "09:15",
    department: "Housekeeping",
    action: "VIP Room 204 Ready",
    status: "completed",
    icon: <CheckCircle2 size={16} />
  },
  {
    id: "e2",
    time: "09:32",
    department: "Kitchen",
    action: "Welcome Kit Placed",
    status: "completed",
    icon: <ChefHat size={16} />
  },
  {
    id: "e3",
    time: "09:40",
    department: "Reception",
    action: "Keycard & Registration Staged",
    status: "current",
    icon: <MapPin size={16} />
  },
  {
    id: "e4",
    time: "09:50",
    department: "Concierge",
    action: "Airport Pickup Initiated",
    status: "upcoming",
    icon: <Clock size={16} />
  },
  {
    id: "e5",
    time: "12:30",
    department: "Management",
    action: "Personal VIP Greeting",
    status: "upcoming",
    icon: <UserPlus size={16} />
  }
];

export function SharedTimeline() {
  return (
    <div className="rounded-sm border border-indigo-100 bg-surface overflow-hidden shadow-premium mb-12">
      <div className="px-6 py-4 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary-hover" />
          <h3 className="text-sm font-medium text-indigo-950 uppercase tracking-wider">Live Thread: VIP Arrival (Room 204)</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-primary-light/20 text-text-primary rounded-none">
          On Schedule
        </span>
      </div>

      <div className="p-8 relative">
        <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-surface-hover" />
        
        <div className="space-y-6 relative">
          {events.map((ev, i) => {
            const isCompleted = ev.status === "completed";
            const isCurrent = ev.status === "current";
            
            return (
              <motion.div 
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-10"
              >
                {/* Timeline Node */}
                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-surface flex-shrink-0 mt-0.5
                  ${isCompleted ? "border-primary text-primary" : 
                    isCurrent ? "border-indigo-600 text-primary-hover shadow-premium" : 
                    "border-primary/50 text-text-muted/80"}
                `}>
                  {ev.icon}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-600 animate-ping opacity-30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary opacity-60 w-10">{ev.time}</span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded
                      ${isCompleted ? "bg-primary/5 text-text-primary" : 
                        isCurrent ? "bg-primary-light/20 text-indigo-700" : 
                        "bg-surface-hover text-text-secondary opacity-60"}
                    `}>
                      {ev.department}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 font-medium ${isCompleted || isCurrent ? "text-text-primary" : "text-text-muted"}`}>
                    {ev.action}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
