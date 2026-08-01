const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.post("/api/tracking/event"'));
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 40).join('\n'));
}
