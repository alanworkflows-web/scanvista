const fs = require('fs');
const path = require('path');

function searchWord(dir, word) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchWord(full, word);
    } else if (/\.(tsx|ts|html)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (new RegExp('\\b' + word + '\\b', 'i').test(l)) {
          console.log(`${path.relative('.', full)}:${idx+1} -> ${l.trim()}`);
        }
      });
    }
  }
}

console.log('Searching for "restaurant" in src/pages and src/components:');
searchWord(path.resolve('src/pages'), 'restaurant');
searchWord(path.resolve('src/components'), 'restaurant');
searchWord(path.resolve('src/ManagerLanding.tsx'), 'restaurant');
