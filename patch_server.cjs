const fs = require('fs');

let c = fs.readFileSync('server.ts', 'utf8');

const doubleRequestFix = `      // Handle Double Requests gracefully
      // @ts-ignore
      if (req.session && req.session.userId) {
        // User is already logged in (likely a browser double-request)
        return res.redirect('/manager/setup');
      }

      if (!queryState) {`;

c = c.replace('      if (!queryState) {', doubleRequestFix);

const orgCreationFix = `      const user = await prisma.user.upsert({
        where: { email: payload.email },
        update: {
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub
        },
        create: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub,
        }
      });

      // Ensure user has an Organization
      let membership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id }
      });
      
      if (!membership) {
        const orgName = user.name ? \`\${user.name.split(' ')[0]}'s Organization\` : 'My Organization';
        const newOrg = await prisma.organization.create({
          data: { name: orgName }
        });
        membership = await prisma.organizationMembership.create({
          data: {
            userId: user.id,
            orgId: newOrg.id,
            role: 'OWNER'
          }
        });
      }`;

c = c.replace(/      const user = await prisma\.user\.upsert\(\{[\s\S]+?\}\);/, orgCreationFix);

fs.writeFileSync('server.ts', c);
console.log('Patched server.ts successfully');
