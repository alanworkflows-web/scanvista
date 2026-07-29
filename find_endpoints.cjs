const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const endpoints = [
  'app.put("/api/manager/properties',
  'app.post("/api/manager/publishing',
  'app.get("/api/properties/:slug"'
];

endpoints.forEach(ep => {
  console.log(`\n--- ${ep} ---`);
  const idx = lines.findIndex(l => l.includes(ep));
  if (idx !== -1) {
    console.log(lines.slice(idx, idx + 40).join('\n'));
  } else {
    console.log('Not found');
  }
});
