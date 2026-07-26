const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_SCAN = ['src'];
const FORBIDDEN_STRING = 'TEST_MODE';

let found = false;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(FORBIDDEN_STRING)) {
        console.error(`❌ FORBIDDEN STRING FOUND: '${FORBIDDEN_STRING}' in ${fullPath}`);
        found = true;
      }
    }
  }
}

console.log('Scanning for banned strings in production code...');
for (const dir of DIRECTORIES_TO_SCAN) {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
}

if (found) {
  console.error('\n🔴 SECURITY CHECK FAILED: Production code contains test bypass logic.');
  process.exit(1);
} else {
  console.log('\n🟢 SECURITY CHECK PASSED: No test bypass logic found in production code.');
  process.exit(0);
}
