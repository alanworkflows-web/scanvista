const fs = require('fs');
const lines = fs.readFileSync('src/pages/GuestWelcome.tsx', 'utf8').split('\n');
const p = lines.findIndex(l => l.includes('title="Menu"'));
if(p !== -1) console.log(lines.slice(p - 5, p + 20).join('\n'));
