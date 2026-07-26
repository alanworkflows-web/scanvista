const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Update Property model
const propertyRegex = /model Property \{[\s\S]*?\n\}/;
schema = schema.replace(propertyRegex, (match) => {
  // Insert new fields before createdAt
  const insertBefore = '  createdAt         DateTime        @default(now())';
  const newFields = `  tagline           String?
  welcomeMessage    String?
  checkInTime       String?
  checkOutTime      String?
  paymentMethods    Json?
  wifiCoverage      String?
  wifiTroubleshooting String?
  contacts          Json?
  conciergeServices Json?
  hotelRules        Json?
  galleryImages     Json?
  activities        Activity[]
  localAttractions  LocalAttraction[]
  faqs              FAQ[]
`;
  return match.replace(insertBefore, newFields + insertBefore);
});

// 2. Update Amenity model
const amenityRegex = /model Amenity \{[\s\S]*?\n\}/;
schema = schema.replace(amenityRegex, (match) => {
  const insertBefore = '  createdAt           DateTime @default(now())';
  const newFields = `  rules               String?
  location            String?
  floor               String?
  directions          String?
  contact             String?
`;
  return match.replace(insertBefore, newFields + insertBefore);
});

// 3. Update Dish model
const dishRegex = /model Dish \{[\s\S]*?\n\}/;
schema = schema.replace(dishRegex, (match) => {
  const insertBefore = '  createdAt       DateTime     @default(now())';
  const newFields = `  preparationTime String?
  isVeg           Boolean      @default(false)
  spiceLevel      String?
`;
  return match.replace(insertBefore, newFields + insertBefore);
});

// 4. Update MenuCategory model
const menuCatRegex = /model MenuCategory \{[\s\S]*?\n\}/;
schema = schema.replace(menuCatRegex, (match) => {
  const insertBefore = '  createdAt    DateTime @default(now())';
  const newFields = `  visibleFrom  String?
  visibleUntil String?
`;
  return match.replace(insertBefore, newFields + insertBefore);
});

// 5. Append new models
const newModels = `
model Activity {
  id              String   @id @default(uuid())
  propertyId      String
  name            String
  description     String?
  location        String?
  time            String?
  bookingRequired Boolean  @default(false)
  visibleFrom     String?
  visibleUntil    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  property        Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}

model LocalAttraction {
  id           String   @id @default(uuid())
  propertyId   String
  name         String
  imageUrl     String?
  distance     String?
  travelTime   String?
  openingHours String?
  mapLink      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  property     Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}

model FAQ {
  id           String   @id @default(uuid())
  propertyId   String
  category     String?
  question     String
  answer       String
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  property     Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
}
`;

schema = schema + newModels;

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema updated successfully');
