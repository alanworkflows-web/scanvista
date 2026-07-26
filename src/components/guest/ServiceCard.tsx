import React from 'react';

interface ServiceCardProps {
  icon?: string; // emoji or icon string
  key?: React.Key; title: string;
  responseTime?: string;
  actionText?: string;
  onAction?: () => void;
}

export function ServiceCard({ icon, title, responseTime, actionText = "Request", onAction }: ServiceCardProps) {
  return (
    <div className="bg-surface border border-[#EAE8E1] p-8 flex flex-col justify-between min-h-[140px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-[#D4AF37] transition-colors cursor-pointer" onClick={onAction}>
      <div>
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <h4 className="font-serif text-lg text-[#2A2A2A]">{title}</h4>
      </div>
      <div className="mt-4 flex justify-between items-end">
        {responseTime && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#8B8878]">Usually arrives</p>
            <p className="text-xs text-[#5A5A5A]">{responseTime}</p>
          </div>
        )}
        <span className="text-xs tracking-widest uppercase font-medium text-[#D4AF37]">{actionText}</span>
      </div>
    </div>
  );
}
