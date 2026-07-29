const fs = require('fs');

let c;
// 1. MenuStudio.tsx
c = fs.readFileSync('src/components/MenuStudio.tsx', 'utf8');
c = c.replace(/status=\{[^}]+\}/g, '');
fs.writeFileSync('src/components/MenuStudio.tsx', c);

// 2. ManagerHelp.tsx
c = fs.readFileSync('src/pages/ManagerHelp.tsx', 'utf8');
c = c.replace(/status=\{[^}]+\}/g, '');
fs.writeFileSync('src/pages/ManagerHelp.tsx', c);

// 3. ManagerOnboarding.tsx
c = fs.readFileSync('src/pages/ManagerOnboarding.tsx', 'utf8');
c = c.replace(/onChange=\{/g, 'onImageSelected={').replace(/value=\{/g, 'currentImage={');
fs.writeFileSync('src/pages/ManagerOnboarding.tsx', c);
