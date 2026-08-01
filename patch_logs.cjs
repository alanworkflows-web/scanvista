const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const logFn = `
function logAuthLookup(req, property, endpoint) {
  console.log(\`=== AUTHENTICATION DIAGNOSTIC (\${endpoint}) ===\`);
  console.log(\`- req.session.userId: \`, req.session?.userId);
  console.log(\`- property: \`, property ? {
    id: property.id,
    slug: property.slug,
    ownerId: property.ownerId,
    orgId: property.orgId
  } : null);
  if (property && req.session?.userId) {
    console.log(\`- owner matches userId?: \`, property.ownerId === req.session.userId);
  }
  console.log(\`===============================================\`);
}
`;

if (!code.includes('logAuthLookup')) {
  // Insert logFn after imports
  code = code.replace('const app = express();', logFn + '\nconst app = express();');

  // Patch PUT /api/manager/properties/:slug
  code = code.replace(
    'const currentProperty = await prisma.property.findUnique({',
    `const currentProperty = await prisma.property.findUnique({`
  );
  code = code.replace(
    'if (!currentProperty || currentProperty.ownerId !== req.session.userId) {',
    `logAuthLookup(req, currentProperty, 'PUT /api/manager/properties/:slug');\n      if (!currentProperty || currentProperty.ownerId !== req.session.userId) {`
  );

  // Patch PUT /api/manager/properties/:slug/amenities
  code = code.replace(
    'const property = await prisma.property.findFirst({\n        where: { slug: req.params.slug, ownerId: req.session.userId },\n        include: { subscription: true }\n      });\n      if (!property) return res.status(403).json({ error: "Unauthorized or property not found" });',
    `const property = await prisma.property.findUnique({ where: { slug: req.params.slug }, include: { subscription: true } });
      logAuthLookup(req, property, 'PUT /api/manager/properties/:slug/amenities');
      if (!property || property.ownerId !== req.session.userId) return res.status(403).json({ error: "Unauthorized or property not found" });`
  );

  // Patch PUT /api/manager/properties/:slug/rules
  code = code.replace(
    'const property = await prisma.property.findFirst({\n        where: { slug: req.params.slug, ownerId: req.session.userId },\n        include: { subscription: true }\n      });\n      if (!property) return res.status(403).json({ error: "Unauthorized or property not found" });',
    `const property = await prisma.property.findUnique({ where: { slug: req.params.slug }, include: { subscription: true } });
      logAuthLookup(req, property, 'PUT /api/manager/properties/:slug/rules');
      if (!property || property.ownerId !== req.session.userId) return res.status(403).json({ error: "Unauthorized or property not found" });`
  );

  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with logging.");
} else {
  console.log("Already patched.");
}
