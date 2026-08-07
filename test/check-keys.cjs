const fs = require('fs');
const logFile = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97\\.system_generated\\tasks\\task-5547.log';
const content = fs.readFileSync(logFile, 'utf8');
const jsonStart = content.indexOf('{');
const data = JSON.parse(content.substring(jsonStart));

console.log("currentProp keys:", Object.keys(data.currentProp?.data || {}));
console.log("fullProp keys:", Object.keys(data.fullProp?.data || {}));
console.log("publicProp keys:", Object.keys(data.publicProp?.data || {}));

console.log("\npublicProp Amenities:", JSON.stringify(data.publicProp?.data?.amenities, null, 2));
console.log("\npublicProp Categories:", JSON.stringify(data.publicProp?.data?.categories, null, 2));
