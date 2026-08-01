const fs = require('fs');

let code = fs.readFileSync('src/components/ui/SyncStatus.tsx', 'utf8');
code = code.replace(
  "Everything synced",
  "Draft pending"
);
code = code.replace(
  "Everything synced just now",
  "Draft pending"
);

fs.writeFileSync('src/components/ui/SyncStatus.tsx', code);
console.log("Patched SyncStatus");
