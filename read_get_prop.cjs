const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.get("/api/properties/:slug"'));
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 50).join('\n'));
} else {
  console.log("Endpoint not found.");
}
