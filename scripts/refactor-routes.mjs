import fs from 'fs';
import path from 'path';

const serverFile = path.resolve('server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

if (!content.includes('import { initRoutes, managerGet, managerPost, managerPut, managerDelete }')) {
  content = content.replace(
    'import { requireAuth, requireOrgAccess, requirePropertyAccess } from "./src/middleware/auth";',
    'import { requireAuth, requireOrgAccess, requirePropertyAccess } from "./src/middleware/auth";\nimport { initRoutes, managerGet, managerPost, managerPut, managerDelete } from "./src/lib/routes";\nimport { logEvent } from "./src/lib/events";\nimport { can } from "./src/lib/permissions";'
  );
}

if (!content.includes('initRoutes(app);')) {
  content = content.replace(
    'const app = express();',
    'const app = express();\n  initRoutes(app);'
  );
}

// Convert app.METHOD("/api/manager/...", [middlewares], async (req, res) => { ... })
// to managerMETHOD("/api/manager/...", [middlewares], "ADMIN", async (req, res) => { ... })

const methods = ['get', 'post', 'put', 'delete'];

for (const method of methods) {
  // Regex looks for: app.method("/api/manager/something", [require...], async (req, res) => {
  const regex = new RegExp(`app\\.${method}\\(("/api/manager/[^"]+"),\\s*(\\[.*?\\]|requireAuth),\\s*(async\\s*\\(req,\\s*res\\)\\s*=>\\s*\\{)`, 'g');
  
  content = content.replace(regex, (match, pathStr, middlewares, handlerStart) => {
    let requiredRole = '"ADMIN"';
    if (pathStr.includes('portal') || (method === 'post' && pathStr === '"/api/manager/properties"')) {
      requiredRole = '"OWNER"';
    }
    
    // Capitalize first letter of method
    const capitalizedMethod = method.charAt(0).toUpperCase() + method.slice(1);
    const helperName = `manager${capitalizedMethod}`;
    
    return `${helperName}(${pathStr}, ${middlewares}, ${requiredRole}, ${handlerStart}`;
  });
}

// We also need to fix app.get("/api/me", requireAuth, async (req, res) => ...) to use generic defineRoute? 
// No, the user mainly cares about the regression suite for manager routes right now. 
// We can manually add defineRoute for /api/me later if needed.

fs.writeFileSync(serverFile, content);
console.log('Refactored server.ts routes');
