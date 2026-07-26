const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

// 1. Expand PropertySchema
const propSchemaRegex = /const PropertySchema = z\.object\(\{[\s\S]*?\}\);/;
const newPropSchema = `const PropertySchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    bannerUrl: z.string().url().max(1000).optional().or(z.literal("")),
    propertyType: z.enum(["HOTEL", "HOMESTAY", "RESORT", "RETREAT"]).optional(),
    wifiNetwork: z.string().max(100).optional(),
    wifiPassword: z.string().max(100).optional(),
    hostInfo: z.string().max(2000).optional(),
    houseRules: z.string().max(2000).optional(),
    experiences: z.string().max(2000).optional(),
    receptionPhone: z.string().max(50).optional(),
    roomServicePhone: z.string().max(50).optional(),
    housekeepingPhone: z.string().max(50).optional(),
    emergencyPhone: z.string().max(50).optional(),
    tagline: z.string().max(255).optional(),
    welcomeMessage: z.string().max(2000).optional(),
    checkInTime: z.string().max(50).optional(),
    checkOutTime: z.string().max(50).optional(),
    paymentMethods: z.any().optional(),
    wifiCoverage: z.string().max(1000).optional(),
    wifiTroubleshooting: z.string().max(2000).optional(),
    contacts: z.any().optional(),
    conciergeServices: z.any().optional(),
    hotelRules: z.any().optional(),
    galleryImages: z.any().optional(),
  });`;

content = content.replace(propSchemaRegex, newPropSchema);

// 2. Expand AmenitySchema
const amenitySchemaRegex = /const AmenitySchema = z\.object\(\{[\s\S]*?\}\);/;
const newAmenitySchema = `const AmenitySchema = z.object({
    name: z.string().trim().min(1).max(255),
    description: z.string().max(1000).optional(),
    openTime: z.string().max(20).optional(),
    closeTime: z.string().max(20).optional(),
    requiresReservation: z.boolean().optional(),
    rules: z.string().max(2000).optional(),
    location: z.string().max(255).optional(),
    floor: z.string().max(50).optional(),
    directions: z.string().max(1000).optional(),
    contact: z.string().max(100).optional(),
  });`;
content = content.replace(amenitySchemaRegex, newAmenitySchema);

// 3. Expand DishSchema
const dishSchemaRegex = /const DishSchema = z\.object\(\{[\s\S]*?\}\);/;
const newDishSchema = `const DishSchema = z.object({
    name: z.string().trim().min(1).max(255),
    price: z.number().min(0),
    categoryId: z.string().uuid(),
    allergens: z.string().optional(),
    healthTips: z.string().optional(),
    isOutOfStock: z.boolean().optional(),
    preparationTime: z.string().max(100).optional(),
    isVeg: z.boolean().optional(),
    spiceLevel: z.string().max(50).optional(),
  });`;
content = content.replace(dishSchemaRegex, newDishSchema);

// 4. Update the Dish creation route if needed (we just pass validatedData to prisma, so it will automatically pick up the new fields)

fs.writeFileSync(serverPath, content, 'utf8');
console.log('Successfully patched server.ts');
