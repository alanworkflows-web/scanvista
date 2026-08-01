const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('app.get("/api/guests/:token"'));
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 50).join('\n'));
} else {
  const idx2 = lines.findIndex(l => l.includes('app.get("/api/guests/'));
  if (idx2 !== -1) {
    console.log(lines.slice(idx2, idx2 + 50).join('\n'));
  }
}
