const fs = require('fs');
const path = require('path');

const p1 = 'C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97/test_hello.png';
const p2 = 'c:/Users/alok anand magada/Documents/scanvista/screenshots/test_hello.png';

fs.writeFileSync(p1, Buffer.from('hello from test_write'));
fs.writeFileSync(p2, Buffer.from('hello from test_write'));

console.log('p1 exists:', fs.existsSync(p1));
console.log('p2 exists:', fs.existsSync(p2));
