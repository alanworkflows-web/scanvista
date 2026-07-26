import React from 'react';

interface PaymentBadgeProps {
  methods: string[]; // e.g. ["Visa", "Mastercard", "UPI", "Cash", "Google Pay", "Apple Pay"]
  securityDeposit?: string;
  gstInvoice?: string;
  internationalCards?: string;
  cashlessProperty?: string;
}

const methodIcons: Record<string, string> = {
  "Visa": "💳",
  "Mastercard": "💳",
  "American Express": "💳",
  "UPI": "📱",
  "Google Pay": "🟢",
  "Apple Pay": "",
  "Cash": "💵"
};

export function PaymentBadge({ methods, securityDeposit, gstInvoice, internationalCards, cashlessProperty }: PaymentBadgeProps) {
  return (
    <div className="bg-surface border border-[#EAE8E1] p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <h3 className="font-serif text-xl text-[#2A2A2A] mb-4">Accepted Payments</h3>
      
      <div className="flex flex-wrap gap-2 mb-12">
        {methods.map(method => (
          <div key={method} className="flex items-center gap-2 bg-background border border-[#EAE8E1] px-3 py-2 rounded-sm text-sm text-[#2A2A2A]">
            <span>{methodIcons[method] || "💳"}</span>
            <span>{method}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#EAE8E1] pt-4 grid grid-cols-2 gap-y-4 gap-x-4">
        {securityDeposit && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#8B8878] mb-1">Security Deposit</p>
            <p className="text-sm text-[#5A5A5A]">{securityDeposit}</p>
          </div>
        )}
        {gstInvoice && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#8B8878] mb-1">GST Invoice</p>
            <p className="text-sm text-[#5A5A5A]">{gstInvoice}</p>
          </div>
        )}
        {internationalCards && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#8B8878] mb-1">Intl. Cards</p>
            <p className="text-sm text-[#5A5A5A]">{internationalCards}</p>
          </div>
        )}
        {cashlessProperty && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#8B8878] mb-1">Cashless Property</p>
            <p className="text-sm text-[#5A5A5A]">{cashlessProperty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
