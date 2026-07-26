import React from 'react';
import { evaluateVisibility, VisibilityConfig } from '../../lib/visibilityEngine';

interface StatusItem {
  name: string;
  config: VisibilityConfig;
}

interface PropertyStatusStripProps {
  items: StatusItem[];
}

export function PropertyStatusStrip({ items }: PropertyStatusStripProps) {
  const currentTime = new Date();
  
  const openNow: {name: string, message?: string}[] = [];
  const comingUp: {name: string, message?: string, mins: number}[] = [];

  items.forEach(item => {
    const result = evaluateVisibility(item.config, currentTime);
    if (result.state === 'OPEN_NOW') {
      openNow.push({ name: item.name });
    } else if (result.state === 'COMING_UP') {
      comingUp.push({ name: item.name, message: result.message, mins: result.comingUpInMins || 0 });
    }
  });

  comingUp.sort((a, b) => a.mins - b.mins);

  if (openNow.length === 0 && comingUp.length === 0) return null;

  return (
    <div className="bg-background border-b border-[#EAE8E1] px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {openNow.length > 0 && (
          <div>
            <h3 className="text-[10px] tracking-widest uppercase font-semibold text-[#8B8878] mb-3">Open Now</h3>
            <div className="flex flex-wrap gap-2">
              {openNow.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-surface border border-[#EAE8E1] px-3 py-1.5 rounded-full shadow-premium">
                  <div className="w-2 h-2 rounded-full bg-primary/50" />
                  <span className="text-sm font-medium text-[#2A2A2A]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {comingUp.length > 0 && (
          <div>
            <h3 className="text-[10px] tracking-widest uppercase font-semibold text-[#8B8878] mb-3">Coming Up</h3>
            <div className="flex flex-wrap gap-2">
              {comingUp.map((item, idx) => (
                <div key={idx} className="flex flex-col bg-surface border border-[#EAE8E1] px-3 py-2 rounded-sm shadow-premium">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-[#2A2A2A]">{item.name}</span>
                  </div>
                  <span className="text-xs text-[#8B8878] pl-3.5">{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
