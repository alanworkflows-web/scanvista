const fs = require('fs');

function addTrackEventToGuestWelcome() {
  const file = 'src/pages/GuestWelcome.tsx';
  let code = fs.readFileSync(file, 'utf8');
  // Wire up trackEvent when opening sections
  if (!code.includes('const handleSectionClick = (sectionId: string) => {')) {
    code = code.replace(
      'return (',
      `const handleSectionClick = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
    if (activeSection !== sectionId && journey?.property?.id && !isPreview) {
      if (sectionId === 'menu') trackEvent(journey.property.id, 'VIEWED', 'MENU', { section: sectionId });
      else trackEvent(journey.property.id, 'VIEWED', 'RECOMMENDATION', { section: sectionId });
    }
  };

  return (`
    );

    code = code.replace(/setActiveSection\(([^)]+)\)/g, (match, p1) => {
      // Ignore inside handleSectionClick or initialization
      if (match.includes('stay-info') || match.includes('checkout') || match.includes('highlights') || p1.includes('?')) return match;
      return `handleSectionClick(${p1})`;
    });
    fs.writeFileSync(file, code);
    console.log("Patched GuestWelcome.tsx trackEvent");
  }
}

function patchContactCard() {
  const file = 'src/components/guest/ContactCard.tsx';
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('trackEvent')) {
    code = code.replace('export function ContactCard({', 'import { trackEvent } from "../../lib/tracking";\n\nexport function ContactCard({');
    code = code.replace(
      'onClick={() => window.open(`tel:${phone}`)}',
      'onClick={() => {\n            if (propertyId) trackEvent(propertyId, "EXECUTED", "RECOMMENDATION", { type: "phone" });\n            window.open(`tel:${phone}`);\n          }}'
    );
    code = code.replace(
      'onClick={() => window.open(`https://wa.me/${whatsapp}`)}',
      'onClick={() => {\n            if (propertyId) trackEvent(propertyId, "EXECUTED", "RECOMMENDATION", { type: "whatsapp" });\n            window.open(`https://wa.me/${whatsapp}`);\n          }}'
    );
    code = code.replace(
      'onClick={() => window.open(website, \'_blank\')}',
      'onClick={() => {\n            if (propertyId) trackEvent(propertyId, "EXECUTED", "RECOMMENDATION", { type: "website" });\n            window.open(website, "_blank");\n          }}'
    );
    
    // We need propertyId from props
    if (!code.includes('propertyId: string')) {
      code = code.replace('email?: string;', 'email?: string;\n  propertyId?: string;');
      code = code.replace('{ phone, email, website, whatsapp }:', '{ phone, email, website, whatsapp, propertyId }:');
    }
    fs.writeFileSync(file, code);
    console.log("Patched ContactCard.tsx trackEvent");
  }
}

addTrackEventToGuestWelcome();
patchContactCard();
