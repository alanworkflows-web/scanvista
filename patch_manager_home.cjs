const fs = require('fs');

let code = fs.readFileSync('src/pages/ManagerHome.tsx', 'utf8');

// 1. Greeting
code = code.replace(
  "Good Morning, {property.owner?.name?.split(' ')[0] || 'Manager'}",
  "Good Morning, {property.owner?.name?.split(' ')[0] || 'Team'}"
);

// 2. Empty analytics text
code = code.replace(
  "No ScanVista activity recorded yesterday.",
  "No guest activity yet.\\nOnce guests scan your QR code,\\nanalytics will appear here automatically."
);
code = code.replace(
  "No interaction activity recorded yesterday.",
  "No guest activity yet.\\nOnce guests scan your QR code,\\nanalytics will appear here automatically."
);

// 3. Publishing Status card - single state
const oldPubStatus = `<div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Publishing Status</h2>
               <div className="space-y-3">
                  {[
                    { label: 'Property Info', icon: <Image size={14}/>, isPublished: !status.hasChanges }, // Simplification for demo
                    { label: 'Menu', icon: <Utensils size={14}/>, isPublished: !status.hasChanges },
                    { label: 'Amenities', icon: <MapPin size={14}/>, isPublished: !status.hasChanges },
                    { label: 'House Rules', icon: <Shield size={14}/>, isPublished: !status.hasChanges },
                    { label: 'Guest Page', icon: <Globe size={14}/>, isPublished: !status.hasChanges },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                        <span className="text-text-muted">{item.icon}</span> {item.label}
                      </div>
                      <span className={\`text-[10px] uppercase font-bold px-2 py-0.5 rounded \${item.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}\`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))}
               </div>
            </div>`;

const newPubStatus = `<div className="bg-surface border border-divider rounded-xl p-8 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-6">Publishing Status</h2>
               <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                       <span className={\`text-xs uppercase font-bold px-3 py-1 rounded-full \${status.badgeColor}\`}>
                         {status.label}
                       </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {status.subtext}
                  </p>
               </div>
            </div>`;

code = code.replace(oldPubStatus, newPubStatus);

// 4. Quick actions padding
code = code.replace(
  "className=\"flex flex-wrap gap-3\"",
  "className=\"grid grid-cols-2 sm:flex sm:flex-wrap gap-3\""
);

fs.writeFileSync('src/pages/ManagerHome.tsx', code);
console.log('ManagerHome patched');
