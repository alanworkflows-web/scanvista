import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('schemaVersion')) {
  schema = schema.replace(
    /model ActivityEvent \{\n\s*id\s*String\s*@id @default\(uuid\(\)\)/,
    'model ActivityEvent {\n  id             String    @id @default(uuid())\n  schemaVersion  Int       @default(1)'
  );
}

const metricSnapshotModel = `
model MetricSnapshot {
  id             String   @id @default(uuid())
  organizationId String?
  propertyId     String?
  metricKey      String
  bucket         String   // e.g. "2026-07-17", "2026-W28", "2026-07"
  bucketType     String   // "DAILY", "WEEKLY", "MONTHLY"
  value          Float
  metadata       Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([organizationId, propertyId, metricKey, bucket, bucketType])
}
`;

if (!schema.includes('model MetricSnapshot')) {
  schema += metricSnapshotModel;
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully');
