const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('ownerId') || l.includes('orgId')) {
    console.log(`${i + 1}: ${l}`);
  }
});
