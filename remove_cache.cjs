const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf8');

const oldCache = `      // Basic memory cache (TTL: 30s)
      const cached = publicPropertyCache.get(slug);
      if (cached && Date.now() - cached.timestamp < 30000) {
        return res.json(cached.data);
      }`;

const newCache = `      // Cache removed for instantaneous pilot updates`;

if (code.includes(oldCache)) {
  fs.writeFileSync('server.ts', code.replace(oldCache, newCache));
  console.log("Removed cache");
} else {
  console.log("Cache block not found");
}
