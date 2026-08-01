const fs = require('fs');
let code = fs.readFileSync('src/components/manager/menu/GuestMenuPreview.tsx', 'utf8');

code = code.replace(
  'Contains: {dish.allergens}',
  'Contains: {(() => { try { const a = JSON.parse(dish.allergens); return Array.isArray(a) ? a.join(", ") : dish.allergens; } catch { return dish.allergens; } })()}'
);

fs.writeFileSync('src/components/manager/menu/GuestMenuPreview.tsx', code);
console.log("Patched GuestMenuPreview allergens");
