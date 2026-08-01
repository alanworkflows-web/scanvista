const fs = require('fs');

const file = 'src/pages/GuestWelcome.tsx';
let code = fs.readFileSync(file, 'utf8');

const fabCode = `
      {/* FAB for Reception */}
      {property.receptionPhone && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
          <a
            href={\`tel:\${property.receptionPhone}\`}
            className="pointer-events-auto bg-[#D4AF37] text-white px-8 py-3.5 rounded-full shadow-[0_8px_30px_rgba(212,175,55,0.4)] font-medium tracking-wide flex items-center gap-3 hover:bg-[#C5A030] transition-transform active:scale-95"
            onClick={() => {
              if (property.id && !isPreview) {
                trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'RECEPTION_CALL_CLICK' });
              }
            }}
          >
            <Phone size={20} className="animate-pulse" />
            Call Reception
          </a>
        </div>
      )}
`;

// Insert just before <GlobalFooter />
code = code.replace(
  '<GlobalFooter />',
  `${fabCode}\n      <GlobalFooter />`
);

fs.writeFileSync(file, code);
console.log("Patched GuestWelcome FAB");
