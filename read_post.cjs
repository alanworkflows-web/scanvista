const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('app.post("/api/manager/properties"'));
console.log(lines.slice(start, start + 50).join('\n'));
