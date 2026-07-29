const fs = require('fs');

let c = fs.readFileSync('server.ts', 'utf8');

// 1. Revert the first mistaken upsert back to demo
const demoUpsertStart = c.indexOf('      console.warn("⚠️ GOOGLE_CLIENT_ID not configured, using development bypass login");');
const demoUpsertEnd = c.indexOf('      const rawReturnTo = req.query.returnTo as string;');
if (demoUpsertStart > -1 && demoUpsertEnd > -1) {
  const originalDemo = `      console.warn("⚠️ GOOGLE_CLIENT_ID not configured, using development bypass login");

      const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
          email: "demo@example.com",
          name: "Demo Manager",
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          googleId: "demo-google-id",
        }
      });
      
      // Ensure user has an Organization
      let membership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id }
      });
      
      if (!membership) {
        const orgName = user.name ? \`\${user.name.split(' ')[0]}'s Organization\` : 'My Organization';
        const newOrg = await prisma.organization.create({
          data: { name: orgName, slug: await generateUniqueSlug(orgName) }
        });
        membership = await prisma.organizationMembership.create({
          data: {
            userId: user.id,
            orgId: newOrg.id,
            role: 'OWNER'
          }
        });
      }

`;
  c = c.substring(0, demoUpsertStart) + originalDemo + c.substring(demoUpsertEnd);
}

// 2. Fix the REAL upsert
const realUpsertStart = c.indexOf('      const user = await prisma.user.upsert({');
if (realUpsertStart > -1) {
  const realUpsertFix = `      const user = await prisma.user.upsert({
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
          data: { name: orgName, slug: await generateUniqueSlug(orgName) }
        });
        membership = await prisma.organizationMembership.create({
          data: {
            userId: user.id,
            orgId: newOrg.id,
            role: 'OWNER'
          }
        });
      }`;
  
  const endOfUpsert = c.indexOf('// Safe returnTo retrieved from state data', realUpsertStart);
  c = c.substring(0, realUpsertStart) + realUpsertFix + "\n\n      " + c.substring(endOfUpsert);
}

fs.writeFileSync('server.ts', c);
console.log('Fixed server.ts');
