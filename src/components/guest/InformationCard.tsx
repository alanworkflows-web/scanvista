import React from 'react';

interface InformationCardProps {
  key?: React.Key; title: string;
  image?: string;
  description?: string;
  details: { label: string; value: string }[];
  rules?: string;
  actionText?: string;
  onAction?: () => void;
}

export function InformationCard({ key, title, image, description, details, rules, actionText, onAction }: InformationCardProps) {
  return (
    <div className="bg-surface border border-[#EAE8E1]/40 rounded-sm overflow-hidden shadow-[0_12px_40px_-15px_rgba(0,0,0,0.05)] mb-12 transition-shadow duration-700 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]">
      {image && (
        <div className="h-[280px] w-full relative">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-8 md:p-10">
        <h3 className="font-serif text-[28px] text-[#1A1A1A] mb-4">{title}</h3>
        {description && <p className="text-[#5A5A5A] text-[15px] leading-relaxed mb-12 font-light">{description}</p>}
        
        {details && details.length > 0 && (
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-12">
            {details.map((detail, idx) => (
              <div key={idx}>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">{detail.label}</p>
                <p className="text-[15px] font-medium text-[#2A2A2A]">{detail.value}</p>
              </div>
            ))}
          </div>
        )}

        {rules && (
          <div className="bg-background/50 p-8 mb-12 rounded-sm">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-3">Guidelines</p>
            <ul className="text-[14px] text-[#5A5A5A] space-y-2 font-light list-disc pl-4 marker:text-[#D4AF37]">
              {rules.split('\n').map((rule, idx) => rule.trim() && (
                <li key={idx} className="pl-1">{rule.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        {actionText && (
          <button 
            onClick={onAction}
            className="w-full py-4 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-500 ease-out text-xs tracking-[0.2em] uppercase font-medium rounded-sm"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
