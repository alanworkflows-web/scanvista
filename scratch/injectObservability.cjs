const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { observabilityMiddleware }')) {
  content = content.replace(
    'import { requireAuth, requireOrgAccess, requirePropertyAccess } from "./src/middleware/auth";',
    'import { requireAuth, requireOrgAccess, requirePropertyAccess } from "./src/middleware/auth";\nimport { observabilityMiddleware } from "./src/middleware/observability";'
  );
}

if (!content.includes('app.use(observabilityMiddleware)')) {
  content = content.replace(
    '  app.set("trust proxy", true);',
    '  app.set("trust proxy", true);\n\n  // Observability\n  app.use(observabilityMiddleware);'
  );
}

if (!content.includes('// Global Error Handler')) {
  content = content.replace(
    '  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {',
    `  // Global Error Handler
  app.use((err, req, res, next) => {
    if (req.log) {
      req.log.error({ err }, "Unhandled application error");
    } else {
      console.error(err);
    }
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
        reference: req.id || "unknown"
      }
    });
  });

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {`
  );
}

fs.writeFileSync(file, content);
console.log('Injected observability into server.ts');
