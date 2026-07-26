import React from 'react';
import { Card } from '../../ui/Card';
import { LogIn, LogOut, Coffee } from 'lucide-react';

export function ArrivalsDeparturesTimeline() {
  const events = [
    { id: 1, time: "11:30 AM", type: "arrival", label: "Check-in Rush Begins", count: 12, icon: <LogIn size={14} className="text-primary" /> },
    { id: 2, time: "12:00 PM", type: "service", label: "Lunch Service", count: null, icon: <Coffee size={14} className="text-blue-500" /> },
    { id: 3, time: "02:00 PM", type: "departure", label: "Late Check-outs", count: 3, icon: <LogOut size={14} className="text-amber-500" /> },
  ];

  return (
    <Card className="p-0 border border-divider shadow-premium bg-surface overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-divider bg-background">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Next 4 Hours</h2>
      </div>
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="relative border-l-2 border-divider ml-3 pl-5 space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[27px] top-1 bg-surface p-1 rounded-full border border-divider shadow-premium">
                {event.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-text-muted mb-0.5">{event.time}</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{event.label}</span>
                  {event.count && (
                    <span className="text-xs font-medium bg-surface-hover text-text-secondary opacity-80 px-2 py-0.5 rounded-none">
                      {event.count} {event.type === 'arrival' ? 'Expected' : 'Pending'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
