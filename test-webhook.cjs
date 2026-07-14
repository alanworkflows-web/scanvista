const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  console.log('--- Webhook Events ---'); 
  const events = await prisma.webhookEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }); 
  console.log(JSON.stringify(events, null, 2)); 
  
  console.log('\n--- Subscriptions ---'); 
  const subs = await prisma.subscription.findMany({ orderBy: { createdAt: 'desc' }, take: 2 }); 
  console.log(JSON.stringify(subs, null, 2)); 
  
  console.log('\n--- Properties ---'); 
  const properties = await prisma.property.findMany({ orderBy: { createdAt: 'desc' }, take: 2 }); 
  console.log(JSON.stringify(properties, null, 2)); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
