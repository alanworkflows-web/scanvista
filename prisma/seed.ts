import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding staging database with safe test data...');

  // Create an explicit staging test manager account
  const stagingUser = await prisma.user.upsert({
    where: { email: 'staging-test@scanvista.example.com' },
    update: {},
    create: {
      email: 'staging-test@scanvista.example.com',
      name: 'Staging Test Manager',
      role: 'MANAGER',
    },
  });

  console.log('Staging test user verified:', stagingUser.email);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
