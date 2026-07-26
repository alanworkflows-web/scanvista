const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Add fields to Property
schema = schema.replace(
  '  activities          Activity[]',
  `  maintenanceMode     Json?
  translations        Json?
  snapshots           PropertySnapshot[]
  mediaAssets         MediaAsset[]
  guestInteractions   GuestInteraction[]
  activities          Activity[]`
);

// 2. Add translations to Amenity, MenuCategory, Activity, LocalAttraction, Dish
['Amenity', 'MenuCategory', 'Activity', 'LocalAttraction', 'Dish'].forEach(model => {
  const regex = new RegExp(`(model ${model} {[sS]*?)(  createdAt)`);
  schema = schema.replace(regex, `$1  translations  Json?n$2`);
});

// 3. Append new models
schema += `
model PropertySnapshot {
  id          String   @id @default(uuid())
  propertyId  String
  data        Json
  publishedAt DateTime @default(now())
  publishedBy String?
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}

model MediaAsset {
  id          String   @id @default(uuid())
  propertyId  String
  url         String
  altText     String?
  tags        Json?
  createdAt   DateTime @default(now())
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}

model GuestInteraction {
  id          String   @id @default(uuid())
  propertyId  String
  guestToken  String?
  section     String
  timestamp   DateTime @default(now())
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}
`;

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Sprint 2.3 schema updated successfully');
