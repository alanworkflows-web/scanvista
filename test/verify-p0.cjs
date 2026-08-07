const assert = require('assert');

// 1. Test Sensitive Content Detection
const { detectSensitiveContent } = require('../dist/server.cjs');

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
// Currency formatting logic
const { formatPrice, getCurrencySymbol } = require('../src/lib/currency.ts');

assert.strictEqual(getCurrencySymbol('USD'), '$');
assert.strictEqual(getCurrencySymbol('EUR'), '€');
assert.strictEqual(getCurrencySymbol('GBP'), '£');
assert.strictEqual(getCurrencySymbol('INR'), '₹');
console.log("✔ Currency symbols verified.");

// 3. Test Validation for Publish
console.log("\n=== 3. Testing Publish Validation Rules ===");
const { validateForPublish } = require('../src/lib/validationFramework.ts');

const incompleteProp = {
  property: { name: "Grand Resort" },
  categories: [],
  amenities: []
};
const incompleteRes = validateForPublish(incompleteProp);
assert.strictEqual(incompleteRes.canPublish, false, "Incomplete property should not be publishable");
console.log("✔ Incomplete property blocked with issues:", incompleteRes.issues.map(i => i.title));

const readyProp = {
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
    { id: "amenity-1", name: "Infinity Pool" }
  ]
};

const readyRes = validateForPublish(readyProp);
assert.strictEqual(readyRes.canPublish, true, "Complete valid property should pass publish validation");
console.log("✔ Ready property passed publish check!");

console.log("\n==========================================");
console.log("ALL P0 AUTOMATED VERIFICATION CHECKS PASSED!");
console.log("==========================================");
