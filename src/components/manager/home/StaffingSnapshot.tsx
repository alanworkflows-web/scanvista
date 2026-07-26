import React from 'react';
import { Users, Phone } from 'lucide-react';
import { Card } from '../../ui/Card';

export function StaffingSnapshot() {
  const staffOnShift = [
    { name: "Sarah J.", role: "Front Desk", status: "active" },
    { name: "Mike T.", role: "Concierge", status: "active" },
    { name: "Chef Rosa", role: "Kitchen Lead", status: "busy" },
    { name: "Alex W.", role: "Housekeeping", status: "active" },
  ];

  return (
    <Card className="p-0 border border-divider shadow-premium bg-surface overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-divider bg-background flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">On Shift Now</h2>
        <span className="flex items-center gap-1 text-xs font-medium text-text-secondary opacity-60">
          <Users size={14} /> {staffOnShift.length} Active
        </span>
      </div>
      
      <div className="flex-1 p-8 grid grid-cols-1 gap-3 overflow-y-auto">
        {staffOnShift.map((staff, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-text-secondary opacity-80">
                  {staff.name.charAt(0)}
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${staff.status === 'active' ? 'bg-primary/50' : 'bg-amber-500'}`}></span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary leading-tight">{staff.name}</p>
                <p className="text-xs text-text-secondary opacity-60">{staff.role}</p>
              </div>
            </div>
            <button className="text-text-muted hover:text-primary transition-colors">
              <Phone size={16} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
