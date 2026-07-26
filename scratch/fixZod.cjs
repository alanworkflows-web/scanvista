const fs = require('fs');

const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /if\s*\(err\s+instanceof\s+z\.ZodError\)\s*\{\s*return\s+res\.status\(400\)\.json\(\{\s*error:\s*"Validation Error",\s*details:\s*err\.issues\s*\}\);\s*\}/g;

const replacement = `if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input provided.",
            details: err.issues
          }
        });
      }`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced ZodError handling globally');
