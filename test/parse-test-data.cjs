const fs = require('fs');

const logFile = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97\\.system_generated\\tasks\\task-5547.log';
const content = fs.readFileSync(logFile, 'utf8');

// Find the JSON start in the log
const jsonStart = content.indexOf('{');
const jsonStr = content.substring(jsonStart);
const data = JSON.parse(jsonStr);

console.log("=== INVENTORY OF PRODUCTION TEST DATA ===");

console.log("\n1. PROPERTY & CONTACTS:");
const p = data.fullProp?.data?.property || data.currentProp?.data?.property;
console.log("- Tagline:", p?.tagline);
console.log("- Description:", p?.description);
console.log("- Contacts Email:", p?.contacts?.email);
console.log("- Contacts Phone:", p?.contacts?.phone);
console.log("- Contacts WhatsApp:", p?.contacts?.whatsapp);
console.log("- Reception Phone:", p?.receptionPhone);
console.log("- Housekeeping Phone:", p?.housekeepingPhone);
console.log("- Emergency Phone:", p?.emergencyPhone);
console.log("- Room Service Phone:", p?.roomServicePhone);
console.log("- Hotel Rules:", JSON.stringify(p?.hotelRules, null, 2));

console.log("\n2. GUESTS:");
console.log("Count:", data.guests?.data?.length);
data.guests?.data?.forEach(g => {
  console.log(`- Guest ID: ${g.id}, Name: ${g.name}, Room: ${g.roomNumber}, Phone: ${g.phone}, Status: ${g.status}, Token: ${g.token}`);
});

console.log("\n3. AMENITIES:");
console.log("Count:", data.fullProp?.data?.amenities?.length);
data.fullProp?.data?.amenities?.forEach(a => {
  console.log(`- Amenity ID: ${a.id}, Name: "${a.name}", Description: "${a.description}", Icon: "${a.icon}"`);
});

console.log("\n4. CATEGORIES & DISHES:");
console.log("Categories Count:", data.fullProp?.data?.categories?.length);
data.fullProp?.data?.categories?.forEach(c => {
  console.log(`- Category: "${c.name}" (ID: ${c.id})`);
  c.dishes?.forEach(d => {
    console.log(`  * Dish: "${d.name}" ($${d.price}), Allergens: "${d.allergens}", HealthTips: "${d.healthTips}"`);
  });
});

console.log("\n5. SNAPSHOTS:");
console.log("Snapshots Count:", data.snapshots?.data?.length);
data.snapshots?.data?.slice(0, 3).forEach(s => {
  console.log(`- Snapshot ID: ${s.id}, Published At: ${s.publishedAt}`);
});
