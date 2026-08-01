const fs = require('fs');
let code = fs.readFileSync('src/pages/ManagerHelp.tsx', 'utf8');
code = code.replace("restaurant's growth", "business's growth");
fs.writeFileSync('src/pages/ManagerHelp.tsx', code);
console.log("Patched ManagerHelp");
