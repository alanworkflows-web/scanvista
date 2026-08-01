const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.get("/api/guests/:token"'));
console.log(lines.slice(idx + 50, idx + 100).join('\n'));
