import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting organization migration...");
  
  const users = await prisma.user.findMany({
    include: {
      properties: true,
      memberships: true,
    }
  });

  for (const user of users) {
    let ownerMembership = user.memberships.find(m => m.role === "OWNER");
    
    let orgId: string;
    
    if (!ownerMembership) {
      // Create Organization
      const orgName = user.name ? `${user.name}'s Organization` : `Organization ${user.id.substring(0, 8)}`;
      const orgSlug = `org-${user.id.substring(0, 8)}-${Date.now()}`;
      
      const newOrg = await prisma.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          memberships: {
            create: {
              userId: user.id,
              role: "OWNER"
            }
          }
        }
      });
      
      console.log(`Created organization ${orgName} for user ${user.email}`);
      orgId = newOrg.id;
    } else {
      orgId = ownerMembership.orgId;
    }

    // Attach all properties owned by this user to this organization
    const propertiesToUpdate = user.properties.filter(p => !p.orgId);
    if (propertiesToUpdate.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: { in: propertiesToUpdate.map(p => p.id) }
        },
        data: {
          orgId: orgId
        }
      });
      console.log(`Updated ${propertiesToUpdate.length} properties for user ${user.email}`);
    }
  }
  
  console.log("Migration complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
