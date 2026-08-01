const fs = require('fs');

let code = fs.readFileSync('src/pages/GuestWelcome.tsx', 'utf8');

// 1. Remove receptionPhone from Stay Information
const receptionBlock = `              {property.receptionPhone && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">Reception</p>
                  <a href={\`tel:\${property.receptionPhone}\`} className="text-[14px] text-[#D4AF37]">{property.receptionPhone}</a>
                </div>
              )}`;
code = code.replace(receptionBlock, '');

// 2. Add hasAssistanceOptions
const hasAssistanceOptionsCode = `  const hasAssistanceOptions = property.receptionPhone || property.housekeepingPhone || property.emergencyPhone || property.contacts?.phone || property.contacts?.whatsapp || property.contacts?.email || property.contacts?.website;`;
code = code.replace(
  'const galleryImages = property.galleryImages || [];',
  `${hasAssistanceOptionsCode}\n  const galleryImages = property.galleryImages || [];`
);

// 3. Replace the old Contact block
const oldContactRegex = /\{\/\* CONTACT \*\/\}([\s\S]*?)\{\/\* GALLERY \*\/\}/;

const newAssistanceBlock = `{/* GUEST ASSISTANCE */}
        {hasAssistanceOptions && (
          <AccordionSection 
            title="Guest Assistance" 
            icon={<Phone size={24} strokeWidth={1} />} 
            isOpen={activeSection === "assistance"} 
            onToggle={() => toggleSection("assistance")}
          >
            <div className="bg-surface border border-[#EAE8E1]/40 p-6 rounded-sm shadow-premium space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.receptionPhone && (
                  <a href={\`tel:\${property.receptionPhone}\`} className="flex items-center p-4 border border-[#EAE8E1]/40 rounded hover:bg-background transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'RECEPTION_CALL_CLICK' }) }}>
                    <Phone size={18} className="text-[#D4AF37] mr-3 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A3A095]">Reception</p>
                      <p className="text-sm text-[#2A2A2A]">{property.receptionPhone}</p>
                    </div>
                  </a>
                )}
                {property.housekeepingPhone && (
                  <a href={\`tel:\${property.housekeepingPhone}\`} className="flex items-center p-4 border border-[#EAE8E1]/40 rounded hover:bg-background transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'HOUSEKEEPING_CALL_CLICK' }) }}>
                    <Phone size={18} className="text-[#D4AF37] mr-3 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A3A095]">Housekeeping</p>
                      <p className="text-sm text-[#2A2A2A]">{property.housekeepingPhone}</p>
                    </div>
                  </a>
                )}
                {property.emergencyPhone && (
                  <a href={\`tel:\${property.emergencyPhone}\`} className="flex items-center p-4 border border-red-100 rounded hover:bg-red-50 transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'EMERGENCY_CALL_CLICK' }) }}>
                    <Phone size={18} className="text-red-500 mr-3 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-red-400">Emergency</p>
                      <p className="text-sm text-[#2A2A2A]">{property.emergencyPhone}</p>
                    </div>
                  </a>
                )}
                {property.contacts?.phone && (
                  <a href={\`tel:\${property.contacts.phone}\`} className="flex items-center p-4 border border-[#EAE8E1]/40 rounded hover:bg-background transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'PHONE_CLICK' }) }}>
                    <Phone size={18} className="text-[#D4AF37] mr-3 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A3A095]">Direct Line</p>
                      <p className="text-sm text-[#2A2A2A]">{property.contacts.phone}</p>
                    </div>
                  </a>
                )}
                {property.contacts?.whatsapp && (
                  <a href={\`https://wa.me/\${property.contacts.whatsapp.replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="flex items-center p-4 border border-[#EAE8E1]/40 rounded hover:bg-background transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'WHATSAPP_CLICK' }) }}>
                    <span className="text-[#25D366] mr-3 text-lg shrink-0">💬</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A3A095]">WhatsApp</p>
                      <p className="text-sm text-[#2A2A2A]">{property.contacts.whatsapp}</p>
                    </div>
                  </a>
                )}
                {property.contacts?.email && (
                  <a href={\`mailto:\${property.contacts.email}\`} className="flex items-center p-4 border border-[#EAE8E1]/40 rounded hover:bg-background transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'EMAIL_CLICK' }) }}>
                    <span className="text-[#D4AF37] mr-3 text-lg shrink-0">✉️</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A3A095]">Email</p>
                      <p className="text-sm text-[#2A2A2A] break-all">{property.contacts.email}</p>
                    </div>
                  </a>
                )}
                {property.contacts?.website && (
                  <a href={property.contacts.website.startsWith('http') ? property.contacts.website : \`https://\${property.contacts.website}\`} target="_blank" rel="noreferrer" className="flex items-center p-4 border border-[#EAE8E1]/40 rounded hover:bg-background transition-colors" onClick={() => { if(property.id && !isPreview) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'WEBSITE_CLICK' }) }}>
                    <span className="text-[#D4AF37] mr-3 text-lg shrink-0">🌐</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A3A095]">Website</p>
                      <p className="text-sm text-[#2A2A2A] break-all">{property.contacts.website}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </AccordionSection>
        )}

        {/* GALLERY */}`;

code = code.replace(oldContactRegex, newAssistanceBlock);

fs.writeFileSync('src/pages/GuestWelcome.tsx', code);
console.log("Patched GuestWelcome Contacts");
