import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const addition = `

enum ResourceType {
  PROPERTY
  GUEST
  MENU
  DISH
  ORDER
  PLAYBOOK
  INVENTORY
  STAFF
  ROOM
  RECOMMENDATION
  SUBSCRIPTION
  ORGANIZATION
}

enum ActionType {
  CREATED
  UPDATED
  DELETED
  CHECKED_IN
  CHECKED_OUT
  APPROVED
  REJECTED
  ACCEPTED
  DISMISSED
  LOGIN
  LOGOUT
  VIEWED
  EXECUTED
}

enum EventSource {
  WEB
  MOBILE
  API
  SYSTEM
  AI
  IMPORT
  WEBHOOK
}

enum EventOutcome {
  SUCCESS
  FAILED
  DENIED
  RETRY
}

enum RetentionCategory {
  PERMANENT
  AUDIT
  ANALYTICS
  TELEMETRY
}

model ActivityEvent {
  id             String    @id @default(uuid())
  organizationId String
  propertyId     String?
  actorId        String?
  correlationId  String?
  
  resourceType   ResourceType
  resourceId     String?
  action         ActionType
  
  source         EventSource       @default(API)
  outcome        EventOutcome      @default(SUCCESS)
  retention      RetentionCategory @default(AUDIT)
  
  metadata       Json?
  ipAddress      String?
  device         String?
  timestamp      DateTime  @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  property       Property?    @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  actor          User?        @relation(fields: [actorId], references: [id], onDelete: SetNull)
}
`;

if (!schema.includes('model ActivityEvent')) {
  fs.writeFileSync(schemaPath, schema + addition);
  console.log("ActivityEvent added to schema.prisma");
} else {
  console.log("ActivityEvent already exists in schema");
}
