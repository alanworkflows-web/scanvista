const fs = require('fs');
const logFile = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97\\.system_generated\\tasks\\task-5547.log';
const content = fs.readFileSync(logFile, 'utf8');
const jsonStart = content.indexOf('{');
const data = JSON.parse(content.substring(jsonStart));

const prop = data.currentProp?.data?.property;

console.log("Amenities in Property:");
console.log(JSON.stringify(prop?.amenities, null, 2));

console.log("\nCategories in Property:");
console.log(JSON.stringify(prop?.categories, null, 2));
