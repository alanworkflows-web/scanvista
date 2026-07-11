const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("EP-TINY CONNECTIVITY: PASS");

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`User Count: ${users.length}`);
    if (users.length > 0) {
      console.log(`Earliest User: ${users[0].createdAt}`);
      console.log(`Latest User: ${users[users.length - 1].createdAt}`);
    }

    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`Property Count: ${properties.length}`);
    if (properties.length > 0) {
      console.log(`Earliest Property: ${properties[0].createdAt}`);
      console.log(`Latest Property: ${properties[properties.length - 1].createdAt}`);
    }

    const subscriptions = await prisma.subscription.count();
    console.log(`Subscription Count: ${subscriptions}`);
    
    // Check for Paddle IDs safely
    const paddleSubs = await prisma.subscription.count({
      where: { paddleSubscriptionId: { not: null } }
    });
    console.log(`Subscriptions with Paddle IDs: ${paddleSubs}`);

    const sessions = await prisma.session.count();
    console.log(`Session Count: ${sessions}`);

    const webhooks = await prisma.webhookEvent.count();
    console.log(`WebhookEvent Count: ${webhooks}`);

    const oauthStates = await prisma.oAuthState.count();
    console.log(`OAuthState Count: ${oauthStates}`);

  } catch (e) {
    console.log("EP-TINY CONNECTIVITY: FAIL");
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
