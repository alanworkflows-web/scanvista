const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/res\.status\(500\)\.json\(\{ error: \"Failed to update property\" \}\);/g, 'console.error("PUT ERROR:", err); res.status(500).json({ error: "Failed to update property" });');
fs.writeFileSync('server.ts', code);
