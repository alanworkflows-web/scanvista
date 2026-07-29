const fs = require('fs');

function tightenWhitespace(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace large gaps and padding
  content = content.replace(/gap-10/g, 'gap-6');
  content = content.replace(/gap-y-12/g, 'gap-y-8');
  content = content.replace(/pb-12/g, 'pb-8');
  content = content.replace(/py-12/g, 'py-8');
  content = content.replace(/my-10/g, 'my-6');
  content = content.replace(/mb-12/g, 'mb-8');
  content = content.replace(/mt-12/g, 'mt-8');
  content = content.replace(/p-8/g, 'p-6'); // Reduce card padding slightly to feel more compact

  fs.writeFileSync(filePath, content);
}

tightenWhitespace('src/pages/PropertyPage.tsx');
try {
  tightenWhitespace('src/pages/GuestWelcome.tsx');
} catch (e) {}

console.log('Tightened whitespace');
