const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.get("/api/properties/:slug"'));
console.log(lines.slice(idx + 40, idx + 80).join('\n'));
