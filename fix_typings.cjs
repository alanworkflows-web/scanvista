const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const snapshotData = publishedProperty.snapshots[0].data;',
  'const snapshotData = publishedProperty.snapshots[0].data as any;'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts typings");
