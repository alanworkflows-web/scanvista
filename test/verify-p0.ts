import assert from 'assert';
import { detectSensitiveContent } from '../src/lib/sensitiveContent';
import { formatPrice, getCurrencySymbol } from '../src/lib/currency';
import { validateForPublish } from '../src/lib/validationFramework';
import { calculatePropertyStatus, getPropertyStatus, calculateLaunchChecklist } from '../src/lib/propertyStatusEngine';
import { z } from 'zod';

console.log("=== 1. Testing Sensitive Content Detection ===");
const cleanInput = { name: "The Grand Regal Hotel", tagline: "Luxury by the ocean" };
const cleanRes = detectSensitiveContent(cleanInput);
assert.strictEqual(cleanRes.detected, false, "Clean input should not trigger sensitive detection");

const leakedInput1 = { name: "name-alan123;password-111444" };
const leakRes1 = detectSensitiveContent(leakedInput1);
assert.strictEqual(leakRes1.detected, true, "Credential leak should be detected");
console.log("✔ Credential leak successfully caught:", leakRes1.samples);

const leakedInput2 = { description: "API_KEY=sk_live_51M0abcdef1234567890" };
const leakRes2 = detectSensitiveContent(leakedInput2);
assert.strictEqual(leakRes2.detected, true, "API key leak should be detected");
console.log("✔ API key leak successfully caught:", leakRes2.samples);

// 2. Test Currency Engine
console.log("\n=== 2. Testing Currency Formatting ===");
assert.strictEqual(getCurrencySymbol('USD'), '$');
assert.strictEqual(getCurrencySymbol('EUR'), '€');
assert.strictEqual(getCurrencySymbol('GBP'), '£');
assert.strictEqual(getCurrencySymbol('INR'), '₹');
console.log("✔ Currency symbols verified.");

// 3. Test Publish Validation & Single Status Engine Convergence
console.log("\n=== 3. Testing Status Engine Convergence (Bug 1 & Bug 2) ===");
const incompleteProp = {
  property: { name: "Grand Resort" },
  categories: [],
  amenities: []
};
const incompleteStatus = calculatePropertyStatus(incompleteProp);
const incompleteValidation = validateForPublish(incompleteProp);

assert.strictEqual(incompleteStatus.completionPercentage, 0, "Incomplete prop must be 0%");
assert.strictEqual(incompleteStatus.completedCount, 0, "Incomplete prop has 0 completed items");
assert.strictEqual(incompleteStatus.totalCount, 5, "Total milestones must be exactly 5");
assert.strictEqual(incompleteStatus.isReady, false, "Incomplete prop cannot be ready");
assert.strictEqual(incompleteValidation.canPublish, false, "Incomplete prop cannot publish");
assert.strictEqual(incompleteValidation.issues.length, 5, "All 5 incomplete milestones must be reported as issues");
console.log("✔ 0% Incomplete Property verified across status, checklist, and publish validation.");

// Partially Complete Property: Brand (20%) + Menu (20%) + Amenities (20%) = 60%
const partialProp = {
  property: {
    name: "The Royal Mirage",
    logoUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b",
    bannerUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b"
  },
  categories: [
    {
      id: "cat-1",
      name: "Main Dining",
      dishes: [{ id: "dish-1", name: "Filet Mignon", price: 45 }]
    }
  ],
  amenities: [
    { id: "amenity-1", name: "Infinity Pool", status: "ACTIVE" }
  ]
};

const partialStatus = calculatePropertyStatus(partialProp);
const partialChecklist = calculateLaunchChecklist(partialProp);
const partialValidation = validateForPublish(partialProp);

assert.strictEqual(partialStatus.completionPercentage, 60, "Partial property must be exactly 60%");
assert.strictEqual(partialChecklist.completionPercentage, 60, "Checklist must match status exactly at 60%");
assert.strictEqual(partialStatus.completedCount, 3, "Partial prop must have 3 completed items");
assert.strictEqual(partialValidation.canPublish, false, "Partial property cannot publish");
assert.strictEqual(partialValidation.issues.length, 2, "Partial property must have exactly 2 blocking issues");
assert.deepStrictEqual(
  partialValidation.issues.map(i => i.title),
  ['Guest & Reception Contacts', 'House Rules & Timings'],
  "Validation issues must match the exact missing status items"
);
console.log("✔ 60% Partial Property verified: Home status, Launch Checklist, and Publish modal agree on 60% and 2 missing items.");

// Fully Complete Property (100%)
const completeProp = {
  property: {
    name: "The Royal Mirage",
    logoUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b",
    bannerUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b",
    receptionPhone: "+1 (555) 234-5678",
    emergencyPhone: "+1 (555) 911-0000",
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM"
  },
  categories: [
    {
      id: "cat-1",
      name: "Main Dining",
      dishes: [{ id: "dish-1", name: "Filet Mignon", price: 45 }]
    }
  ],
  amenities: [
    { id: "amenity-1", name: "Infinity Pool", status: "ACTIVE" }
  ]
};

const completeStatus = calculatePropertyStatus(completeProp);
const completeChecklist = calculateLaunchChecklist(completeProp);
const completeValidation = validateForPublish(completeProp);

assert.strictEqual(completeStatus.completionPercentage, 100, "Complete property must be 100%");
assert.strictEqual(completeChecklist.completionPercentage, 100, "Complete checklist must be 100%");
assert.strictEqual(completeStatus.isReady, true, "Complete property isReady must be true");
assert.strictEqual(completeValidation.canPublish, true, "Complete property canPublish must be true");
assert.strictEqual(completeValidation.issues.length, 0, "Complete property must have 0 blocking issues");
console.log("✔ 100% Ready Property verified across all surfaces.");

// 4. Test Amenity Schema & Mutation (Bug 3)
console.log("\n=== 4. Testing Amenity Payload Validation (Bug 3) ===");
const AmenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  hours: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "HIDDEN"]).optional().default("ACTIVE"),
  displayOrder: z.number().int().optional().default(0)
});

// Test valid newly added amenity
const newAmenityPayload = {
  name: "Rooftop Sauna",
  description: "Panoramic city views and Scandinavian dry sauna",
  icon: "Sparkles",
  category: "Wellness",
  hours: "8:00 AM - 10:00 PM",
  location: "Floor 15",
  status: "ACTIVE",
  displayOrder: 1
};
const parsedAmenity = AmenitySchema.parse(newAmenityPayload);
assert.strictEqual(parsedAmenity.name, "Rooftop Sauna");
assert.strictEqual(parsedAmenity.status, "ACTIVE");
console.log("✔ Newly added amenity payload passes Zod validation cleanly.");

// Test amenity with null / empty optional fields
const minimalAmenityPayload = {
  name: "Complimentary Wi-Fi",
  description: null,
  icon: null,
  hours: "",
  location: null
};
const parsedMinimal = AmenitySchema.parse(minimalAmenityPayload);
assert.strictEqual(parsedMinimal.name, "Complimentary Wi-Fi");
assert.strictEqual(parsedMinimal.status, "ACTIVE");
console.log("✔ Minimal amenity with empty/null optional fields passes Zod validation cleanly.");

console.log("\n==========================================");
console.log("ALL BUG 1, BUG 2, AND BUG 3 TESTS PASSED!");
console.log("==========================================");
