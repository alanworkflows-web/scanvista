import React from 'react';
import { Utensils, QrCode, Users, Settings } from 'lucide-react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';

export function QuickActionsGrid() {
  const navigate = useNavigate();

  const actions = [
    { label: "Update Menu", icon: <Utensils size={20} />, path: "/manager/menu", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Guest CRM", icon: <Users size={20} />, path: "/manager/guests", color: "text-primary", bg: "bg-primary/5" },
    { label: "Print QRs", icon: <QrCode size={20} />, path: "/manager/qr", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Settings", icon: <Settings size={20} />, path: "/manager/settings", color: "text-text-secondary opacity-80", bg: "bg-surface-hover" },
  ];

  return (
    <Card className="p-0 border border-divider shadow-premium bg-surface overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-divider bg-background">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Quick Actions</h2>
      </div>
      
      <div className="flex-1 p-8 grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <button 
            key={i}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-8 rounded-sm border border-divider bg-surface hover:bg-background hover:shadow-premium hover:-translate-y-0.5 transition-all active:scale-95 group text-center gap-2"
          >
            <div className={`p-3 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-text-secondary">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
