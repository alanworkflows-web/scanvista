const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.get("/api/manager/properties/:slug/activity"'));
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 60).join('\n'));
}
