import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function AccordionSection({ title, icon, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border-b border-[#EAE8E1]/30 last:border-0 bg-transparent">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-8 px-2 bg-transparent transition-all"
      >
        <div className="flex items-center gap-10">
          {icon && <div className="text-[#C1BDB3] scale-90">{icon}</div>}
          <span className={`font-serif text-[28px] tracking-wide transition-colors duration-700 ${isOpen ? 'text-[#1A1A1A]' : 'text-[#7A7A7A]'}`}>
            {title}
          </span>
        </div>
        <div className={`transition-transform duration-700 ease-in-out ${isOpen ? 'rotate-180 text-[#D4AF37]' : 'text-[#D4AF37]/40'}`}>
          <ChevronDown size={20} strokeWidth={1} />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-[5000px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-2">
          {children}
        </div>
      </div>
    </div>
  );
}
