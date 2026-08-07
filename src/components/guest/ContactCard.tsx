import React from 'react';

interface ContactCardProps {
  key?: React.Key; title: string;
  hours?: string;
  languages?: string[];
  responseTime?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  propertyId?: string;
}

import { trackEvent } from "../../lib/tracking";

export function ContactCard({ key, title, hours, languages, responseTime, phone, whatsapp, email }: ContactCardProps) {
  return (
    <div className="bg-surface border border-[#EAE8E1]/40 p-8 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.05)] mb-12 rounded-sm">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h4 className="font-serif text-[22px] text-[#1A1A1A] mb-1">{title}</h4>
          {hours && <p className="text-[11px] text-[#A3A095] uppercase tracking-[0.15em]">{hours}</p>}
        </div>
      </div>
      
      {(languages || responseTime) && (
        <div className="grid grid-cols-2 gap-10 mb-12 pt-6 border-t border-[#EAE8E1]/30">
          {languages && languages.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">Languages</p>
              <p className="text-[14px] text-[#5A5A5A]">{languages.join(', ')}</p>
            </div>
          )}
          {responseTime && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">Typical Response</p>
              <p className="text-[14px] text-[#5A5A5A]">{responseTime}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-10">
        {phone && (
          <a href={`tel:${phone}`} className="flex-1 min-w-[100px] text-center py-3.5 border border-[#EAE8E1]/60 text-[#2A2A2A] hover:border-[#D4AF37] transition-all duration-500 ease-out text-[10px] tracking-[0.15em] uppercase font-medium rounded-sm">
            Call
          </a>
        )}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] text-center py-3.5 border border-[#EAE8E1]/60 text-[#2A2A2A] hover:border-[#25D366] transition-all duration-500 ease-out text-[10px] tracking-[0.15em] uppercase font-medium rounded-sm">
            WhatsApp
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex-1 min-w-[100px] text-center py-3.5 border border-[#EAE8E1]/60 text-[#2A2A2A] hover:border-[#D4AF37] transition-all duration-500 ease-out text-[10px] tracking-[0.15em] uppercase font-medium rounded-sm">
            Email
          </a>
        )}
      </div>
    </div>
  );
}
