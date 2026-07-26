const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('// Create default organization if none exists')) {
  content = content.replace(
    '        create: {\n          email: payload.email,\n          name: payload.name,\n          picture: payload.picture,\n          googleId: payload.sub,\n        }\n      });',
    `        create: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub,
        }
      });

      // Create default organization if none exists
      const memberships = await prisma.organizationMembership.count({ where: { userId: user.id } });
      if (memberships === 0) {
        const orgSlug = \`org-\${crypto.randomBytes(6).toString('hex')}\`;
        await prisma.organization.create({
          data: {
            name: \`\${user.name || user.email}'s Organization\`,
            slug: orgSlug,
            memberships: {
              create: {
                userId: user.id,
                role: 'OWNER'
              }
            }
          }
        });
      }`
  );
  fs.writeFileSync(file, content);
  console.log('Fixed Google Auth Org provisioning.');
} else {
  console.log('Already provisioned.');
}
