const fs = require('fs');

// GuestWelcome.tsx
let gwCode = fs.readFileSync('src/pages/GuestWelcome.tsx', 'utf8');
gwCode = gwCode.replace(
  '<span className="text-[#A3A095] font-light text-[15px]">${(dish.price || 0).toFixed(2)}</span>',
  '<span className="text-[#A3A095] font-light text-[15px]">{new Intl.NumberFormat(journey?.language || "en-US", { style: "currency", currency: property.currency || "USD" }).format(dish.price || 0)}</span>'
);
fs.writeFileSync('src/pages/GuestWelcome.tsx', gwCode);

// GuestMenuPreview.tsx
let gmpCode = fs.readFileSync('src/components/manager/menu/GuestMenuPreview.tsx', 'utf8');
gmpCode = gmpCode.replace(
  '<span className="font-medium">${dish.price.toFixed(2)}</span>',
  '<span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dish.price || 0)}</span>'
);
fs.writeFileSync('src/components/manager/menu/GuestMenuPreview.tsx', gmpCode);

console.log("Patched currency");
