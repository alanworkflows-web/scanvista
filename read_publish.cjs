const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.post("/api/manager/properties/:slug/publish"'));
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 50).join('\n'));
} else {
  console.log("Not found");
}
