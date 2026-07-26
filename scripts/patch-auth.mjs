import fs from 'fs';
import path from 'path';

const serverFile = path.resolve('server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// Add import
if (!content.includes('import { requireAuth, requireOrgAccess, requirePropertyAccess }')) {
  content = content.replace(
    'import { Paddle, Environment } from "@paddle/paddle-node-sdk";',
    'import { Paddle, Environment } from "@paddle/paddle-node-sdk";\nimport { requireAuth, requireOrgAccess, requirePropertyAccess } from "./src/middleware/auth";'
  );
}

// Remove local requireAuth
content = content.replace(
  /\/\/ Auth middleware\s+const requireAuth = \([\s\S]*?next\(\);\s+};\s+/m,
  ''
);

// Replace route usages
// We want all /api/manager routes to use requireAuth, requireOrgAccess, requirePropertyAccess
content = content.replace(/app\.(get|post|put|patch|delete)\("\/api\/manager\/(.*?)",\s*requireAuth,\s*async/g, 'app.$1("/api/manager/$2", [requireAuth, requireOrgAccess, requirePropertyAccess], async');

// /api/me should only need requireAuth, requireOrgAccess
content = content.replace(/app\.get\("\/api\/me",\s*requireAuth,\s*async/g, 'app.get("/api/me", [requireAuth, requireOrgAccess], async');

fs.writeFileSync(serverFile, content);
console.log('Patched server.ts successfully');
