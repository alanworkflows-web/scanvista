const fs = require('fs');
let content = fs.readFileSync('src/pages/GuestWelcome.tsx', 'utf8');

// Replace escaped backticks with actual backticks
content = content.replace(/\\`/g, '`');

// Replace escaped dollar signs with actual dollar signs
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/GuestWelcome.tsx', content, 'utf8');
console.log('Fixed GuestWelcome.tsx escaping');
