import React, { useEffect, useState } from "react";
import { founderTokens as tokens } from "../design-tokens";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Users, Building, Activity, ShieldAlert, CreditCard, Ticket } from "lucide-react";

interface CommandCenterData {
  hotelsOnline: number;
  incidents: number;
  failedPayments: number;
  downtimeMinutes: number;
  securityAlerts: number;
  supportTickets: number;
  newSignups: number;
  attentionItems: string[];
}

export const FounderHome: React.FC = () => {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData({
        hotelsOnline: 31,
        incidents: 0,
        failedPayments: 1,
        downtimeMinutes: 0,
        securityAlerts: 0,
        supportTickets: 2,
        newSignups: 4,
        attentionItems: [
          "Follow up with Ocean Breeze Resort regarding low adoption.",
          "Resolve failed subscription payment for Org ID: org-889.",
          "Review 2 pending support tickets."
        ]
      });
      setLoading(false);
    }, 600);
  }, []);

  if (loading || !data) {
    return <div style={{ padding: tokens.spacing.xl, fontFamily: tokens.typography.fontFamily.sans }}>Initializing Command Center...</div>;
  }

  const isHealthy = data.incidents === 0 && data.downtimeMinutes === 0 && data.securityAlerts === 0;
  const statusClasses = isHealthy 
    ? "bg-primary/5 text-text-primary border-divider" 
    : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight mb-2">Command Center</h1>
          <p className="text-text-secondary opacity-60">60-Second Business State</p>
        </div>
        <div className={"flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-medium border " + statusClasses}>
          {isHealthy ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          Platform Status: {isHealthy ? 'Fully Operational' : 'Action Required'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <MetricCard title="Hotels Online" value={data.hotelsOnline} icon={<Building size={20} />} trend="+2 this week" />
        <MetricCard title="New Signups (7d)" value={data.newSignups} icon={<Users size={20} />} trend="Stable" />
        <MetricCard title="Failed Payments" value={data.failedPayments} icon={<CreditCard size={20} />} alert={data.failedPayments > 0} />
        <MetricCard title="Support Tickets" value={data.supportTickets} icon={<Ticket size={20} />} warning={data.supportTickets > 5} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <StatusCard title="Incidents (24h)" value={data.incidents} icon={<Activity size={20} />} />
        <StatusCard title="Downtime (24h)" value={data.downtimeMinutes + "m"} icon={<XCircle size={20} />} />
        <StatusCard title="Security Alerts" value={data.securityAlerts} icon={<ShieldAlert size={20} />} />
      </div>

      <div className="bg-surface rounded-sm border border-divider p-8 shadow-premium">
        <h2 className="text-xl font-serif font-medium text-text-primary mb-12 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={24} /> What needs my attention today?
        </h2>
        {data.attentionItems.length === 0 ? (
          <p className="text-text-secondary opacity-60">All clear. Enjoy your day.</p>
        ) : (
          <ul className="space-y-4">
            {data.attentionItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-10 p-8 rounded-sm bg-background border border-divider hover:border-divider transition-colors cursor-pointer group">
                <div className="w-6 h-6 rounded-full bg-primary-light/20 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/50 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">{idx + 1}</span>
                </div>
                <span className="text-text-secondary font-medium">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

function MetricCard({ title, value, icon, trend, alert, warning }: any) {
  const wrapperClass = alert 
    ? "border-red-300 ring-4 ring-red-50" 
    : warning 
      ? "border-amber-300 ring-4 ring-amber-50" 
      : "border-divider";
      
  const iconClass = alert 
    ? "bg-red-100 text-red-600" 
    : warning 
      ? "bg-amber-100 text-amber-600" 
      : "bg-surface-hover text-text-secondary opacity-80";

  return (
    <div className={"bg-surface p-8 rounded-sm border shadow-premium flex flex-col " + wrapperClass}>
      <div className="flex items-center justify-between mb-4">
        <div className={"p-2 rounded-sm " + iconClass}>
          {icon}
        </div>
      </div>
      <div className="text-4xl font-serif text-text-primary mb-1">{value}</div>
      <div className="text-sm font-medium text-text-secondary opacity-60">{title}</div>
      {trend && <div className="mt-2 text-xs font-medium text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-full">{trend}</div>}
    </div>
  );
}

function StatusCard({ title, value, icon }: any) {
  const isZero = value === 0 || value === "0m";
  const wrapperClass = isZero ? 'bg-primary/5/50 border-divider' : 'bg-red-50 border-red-200';
  const iconClass = isZero ? 'bg-primary-light/20 text-primary' : 'bg-red-100 text-red-600';
  const textClass = isZero ? 'text-text-primary' : 'text-red-700';
  
  return (
    <div className={"p-8 rounded-sm border flex items-center gap-10 " + wrapperClass}>
      <div className={"p-3 rounded-full " + iconClass}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-text-secondary opacity-60 mb-1">{title}</div>
        <div className={"text-3xl font-serif text-text-primary " + textClass}>{value}</div>
      </div>
    </div>
  );
}
