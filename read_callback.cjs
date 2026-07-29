const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('app.get("/auth/google/callback"'));
console.log(lines.slice(start, start + 100).join('\n'));
