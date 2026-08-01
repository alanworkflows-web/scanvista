const fs = require('fs');

// ManagerHome
let managerCode = fs.readFileSync('src/pages/ManagerHome.tsx', 'utf8');
managerCode = managerCode.replace(
  "Good Morning, {property.owner?.name?.split(' ')[0] || 'Team'}",
  "{property.owner?.name ? `Good Morning, ${property.owner.name.split(' ')[0]}` : 'Welcome Back'}"
);
fs.writeFileSync('src/pages/ManagerHome.tsx', managerCode);
console.log("Patched ManagerHome greeting");

// GuestWelcome
let guestCode = fs.readFileSync('src/pages/GuestWelcome.tsx', 'utf8');
guestCode = guestCode.replace(
  "Need anything?, Manager",
  "Need anything?"
);
fs.writeFileSync('src/pages/GuestWelcome.tsx', guestCode);
console.log("Patched GuestWelcome greeting");
