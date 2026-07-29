const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(f => {
  if (!f.endsWith('.tsx') && !f.endsWith('.ts')) return;
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (content.includes('variant="outline"')) {
    content = content.replace(/variant="outline"/g, 'variant="secondary"');
    changed = true;
  }
  if (content.includes('variant="danger"')) {
    content = content.replace(/variant="danger"/g, 'variant="secondary"');
    changed = true;
  }
  if (content.includes('aspectRatio="16:9"')) {
    content = content.replace(/aspectRatio="16:9"/g, 'aspectRatio="video"');
    changed = true;
  }
  if (content.includes('aspectRatio="1:1"')) {
    content = content.replace(/aspectRatio="1:1"/g, 'aspectRatio="square"');
    changed = true;
  }
  
  // also fix status="success" on buttons since Button doesn't take status
  if (content.match(/status="(success|idle|loading)"/)) {
     content = content.replace(/status="(success|idle|loading)"/g, '');
     changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
