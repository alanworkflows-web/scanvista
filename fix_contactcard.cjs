const fs = require('fs');

const file = 'src/pages/GuestWelcome.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<ContactCard',
  '<ContactCard propertyId={journey?.property?.id}'
);

fs.writeFileSync(file, code);
console.log("Patched GuestWelcome.tsx ContactCard propertyId");
