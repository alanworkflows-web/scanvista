const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const universalVisibilityFields = `
  alwaysVisible Boolean @default(true)
  visibleFrom   String?
  visibleUntil  String?
  daysActive    Json?
  status        String @default("ACTIVE")`;

const universalImageFields = `
  heroImage     String?
  gallery       Json?`;

// Insert into Property
schema = schema.replace(
  /(model Property {[sS]*?)(  createdAt)/,
  `$1${universalImageFields}n$2`
);

// Insert into Amenity
schema = schema.replace(
  /(model Amenity {[sS]*?)(  createdAt)/,
  `$1${universalVisibilityFields}n${universalImageFields}n$2`
);

// MenuCategory had visibleFrom / visibleUntil, so strip them first
schema = schema.replace(/  visibleFrom  String?n/g, '');
schema = schema.replace(/  visibleUntil String?n/g, '');
schema = schema.replace(
  /(model MenuCategory {[sS]*?)(  createdAt)/,
  `$1${universalVisibilityFields}n${universalImageFields}n$2`
);

// Activity had visibleFrom / visibleUntil, so strip them
schema = schema.replace(/  visibleFrom     String?n/g, '');
schema = schema.replace(/  visibleUntil    String?n/g, '');
schema = schema.replace(
  /(model Activity {[sS]*?)(  createdAt)/,
  `$1${universalVisibilityFields}n${universalImageFields}n  capacity        Int?n$2`
);

// LocalAttraction
schema = schema.replace(
  /(model LocalAttraction {[sS]*?)(  createdAt)/,
  `$1${universalVisibilityFields}n${universalImageFields}n$2`
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema updated successfully');
