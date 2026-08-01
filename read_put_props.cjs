const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('app.put("/api/manager/properties/:slug"'));
console.log(lines.slice(start, start + 40).join('\n'));
