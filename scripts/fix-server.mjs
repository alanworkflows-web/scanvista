import fs from 'fs';
import path from 'path';

const serverFile = path.resolve('server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// 1. Fix isDev to exclude test
content = content.replace(
  'const isDev = process.env.NODE_ENV !== "production";',
  'const isDev = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";'
);

// 2. Fix SESSION_SECRET check to allow test
content = content.replace(
  'if (isDev) {',
  'if (isDev || process.env.NODE_ENV === "test") {'
);

// 3. Fix demo login upsert to create org
content = content.replace(
  `      const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
          email: "demo@example.com",
          name: "Demo Manager",
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          googleId: "demo-google-id",
        }
      });`,
  `      const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
          email: "demo@example.com",
          name: "Demo Manager",
          picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          googleId: "demo-google-id",
        }
      });
      
      const existingMembership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id }
      });
      
      if (!existingMembership) {
        await prisma.organization.create({
          data: {
            name: "Demo Organization",
            slug: "demo-org-" + Date.now(),
            memberships: {
              create: {
                userId: user.id,
                role: "OWNER"
              }
            }
          }
        });
      }`
);

// 4. Fix Google callback upsert to create org
content = content.replace(
  `      const user = await prisma.user.upsert({
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
      });`,
  `      const user = await prisma.user.upsert({
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

      const existingMembership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id }
      });
      
      if (!existingMembership) {
        await prisma.organization.create({
          data: {
            name: \`\${payload.name || 'User'}'s Organization\`,
            slug: \`org-\${user.id.substring(0, 8)}-\${Date.now()}\`,
            memberships: {
              create: {
                userId: user.id,
                role: "OWNER"
              }
            }
          }
        });
      }`
);

fs.writeFileSync(serverFile, content);
console.log('Fixed server.ts successfully');
