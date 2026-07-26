import React from 'react';
import { Wifi, QrCode, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../ui/Card';

export function ServiceHealthGrid() {
  const services = [
    { name: "Digital Menu", status: "online", icon: <Utensils size={18} /> },
    { name: "QR Access", status: "online", icon: <QrCode size={18} /> },
    { name: "Guest Wi-Fi", status: "warning", icon: <Wifi size={18} />, note: "High latency detected" },
  ];

  return (
    <Card className="p-0 border border-divider shadow-premium bg-surface overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-divider bg-background">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Service Health</h2>
      </div>
      
      <div className="flex-1 p-8 grid gap-3">
        {services.map((service, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-sm border border-divider bg-surface/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-none ${service.status === 'online' ? 'bg-primary-light/20 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                {service.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{service.name}</p>
                {service.note && <p className="text-xs text-amber-600">{service.note}</p>}
              </div>
            </div>
            <div>
              {service.status === 'online' ? (
                <CheckCircle2 size={20} className="text-primary" />
              ) : (
                <AlertCircle size={20} className="text-amber-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
