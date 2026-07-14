import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.vercel' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prop = await prisma.property.findUnique({ where: { slug: 'my-property' }, include: { subscription: true } });
  
  if (!prop) {
    console.log('Property not found');
    return;
  }
  
  const sub = prop.subscription;
  
  if (!sub) {
    console.log('No subscription found for property');
    return;
  }
  
  console.log('paddleCustomerId:', sub.paddleCustomerId);
  console.log('paddleSubscriptionId:', sub.paddleSubscriptionId);
  console.log('status:', sub.status);
}

main().finally(async () => await prisma.$disconnect());
