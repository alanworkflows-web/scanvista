const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const property = await prisma\.property\.create\(\{\s*data: \{\s*name,\s*slug,\s*\/\/\s*@ts-ignore\s*ownerId: req\.session\.userId,\s*\}\,/m,
  `const property = await prisma.property.create({\n        data: {\n          name,\n          slug,\n          // @ts-ignore\n          ownerId: req.session.userId,\n          // @ts-ignore\n          orgId: req.userContext.orgId\n        },`
);

fs.writeFileSync(file, content);
console.log('Fixed properties create orgId!');
