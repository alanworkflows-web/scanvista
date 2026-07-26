import fs from 'fs';
import path from 'path';

const serverFile = path.resolve('server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const regex = /const property = await prisma\.property\.create\(\{\s*data:\s*\{\s*name,\s*slug,\s*ownerId:\s*req\.session\.userId,\s*orgId:\s*req\.userContext\.orgId\s*\}\s*\}\);/;

const replacement = `const property = await prisma.property.create({ data: { name, slug, ownerId: req.session.userId, orgId: req.userContext.orgId } });

      await logEvent({
        organizationId: req.userContext.orgId,
        propertyId: property.id,
        actorId: req.userContext.userId,
        resourceType: "PROPERTY",
        resourceId: property.id,
        action: "CREATED",
        metadata: { name: property.name, slug: property.slug }
      });`;

content = content.replace(regex, replacement);

fs.writeFileSync(serverFile, content);
console.log('Injected logEvent into property creation');
