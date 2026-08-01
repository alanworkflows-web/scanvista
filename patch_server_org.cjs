const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add generateUniqueOrgSlug
const slugGeneratorCode = `
  async function generateUniqueOrgSlug(baseName: string): Promise<string> {
    let base = baseName
      .toLowerCase()
      .normalize('NFD').replace(/[\\u0300-\\u036f]/g, "")
      .replace(/[^a-z0-9\\s-]/g, "")
      .trim()
      .replace(/\\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!base || base.length === 0) {
      base = "organization";
    }
    base = base.substring(0, 50).replace(/-$/, "");

    let uniqueSlug = base;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = \`\${base}-\${counter}\`;
      counter++;
    }
    return uniqueSlug;
  }
`;

if (!code.includes('generateUniqueOrgSlug')) {
  code = code.replace('async function generateUniqueSlug', slugGeneratorCode + '\n  async function generateUniqueSlug');
}

// Fix OAuth callback
code = code.replace(
  'slug: await generateUniqueSlug(orgName)',
  'slug: await generateUniqueOrgSlug(orgName)'
);

// Fix POST /api/manager/properties auto-provisioning
const oldPostProps = `      const membership = await prisma.organizationMembership.findFirst({
        where: { userId: req.session.userId as string }
      });
      if (!membership) {
        return res.status(403).json({ error: "User is not part of an organization" });
      }`;

const newPostProps = `      let membership = await prisma.organizationMembership.findFirst({
        where: { userId: req.session.userId as string }
      });
      if (!membership) {
        const user = await prisma.user.findUnique({ where: { id: req.session.userId as string } });
        if (!user) return res.status(403).json({ error: "User not found" });
        const orgName = user.name ? \`\${user.name.split(' ')[0]}'s Organization\` : 'My Organization';
        const newOrg = await prisma.organization.create({
          data: { name: orgName, slug: await generateUniqueOrgSlug(orgName) }
        });
        membership = await prisma.organizationMembership.create({
          data: { userId: user.id, orgId: newOrg.id, role: 'OWNER' }
        });
      }`;

code = code.replace(oldPostProps, newPostProps);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully.");
