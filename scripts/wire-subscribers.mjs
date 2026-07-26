import fs from 'fs';
import path from 'path';

const eventsPath = path.resolve('src/lib/events.ts');
let content = fs.readFileSync(eventsPath, 'utf8');

if (!content.includes('import { analyticsSubscriber }')) {
  content = content.replace(
    'const prisma = new PrismaClient();',
    `const prisma = new PrismaClient();\n\nimport { analyticsSubscriber } from "../platform/subscribers/analytics.subscriber";\nimport { timelineSubscriber } from "../platform/subscribers/timeline.subscriber";\nimport { notificationSubscriber } from "../platform/subscribers/notification.subscriber";`
  );
  
  content = content.replace(
    'const subscribers: EventSubscriber[] = [];',
    `const subscribers: EventSubscriber[] = [\n  analyticsSubscriber,\n  timelineSubscriber,\n  notificationSubscriber\n];`
  );
  
  fs.writeFileSync(eventsPath, content);
  console.log('Subscribers wired');
} else {
  console.log('Subscribers already wired');
}
