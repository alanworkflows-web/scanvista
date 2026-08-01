const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove cache from /api/properties/:slug just in case
code = code.replace(
  'const cached = publicPropertyCache.get(slug);\n      if (cached && Date.now() - cached.timestamp < 30000) {\n        return res.json(cached.data);\n      }',
  '// Cache removed for instantaneous pilot updates'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts cache");
