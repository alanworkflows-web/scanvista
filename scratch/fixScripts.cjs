const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}

fix('scripts/db-backup.cjs');
fix('scripts/db-restore.cjs');
console.log('Fixed scripts');
