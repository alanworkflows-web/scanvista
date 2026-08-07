const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const targetKeywords = ['demo', 'mock', 'placeholder', 'todo', 'fixme', 'test data'];

const ignoreDirs = ['node_modules', '.git', 'dist', '.gemini', 'coverage'];

function scanDir(dir, results = {}) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (ignoreDirs.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, results);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.html', '.css', '.json', '.md'].includes(ext)) {
        // Exclude scripts and test files from app occurrences check, but also list them separately if needed
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const lower = line.toLowerCase();
          for (const kw of targetKeywords) {
            if (lower.includes(kw)) {
              if (!results[kw]) results[kw] = [];
              const relPath = path.relative(rootDir, fullPath);
              results[kw].push({
                file: relPath,
                line: idx + 1,
                snippet: line.trim()
              });
            }
          }
        });
      }
    }
  }
  return results;
}

const results = scanDir(rootDir);

// Write results to artifact
const artifactPath = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97/repo_scan_occurrences.json');
fs.writeFileSync(artifactPath, JSON.stringify(results, null, 2));

console.log('=== SUMMARY OF SCAN OCCURRENCES ===');
for (const kw of targetKeywords) {
  const list = results[kw] || [];
  console.log(`\nKeyword: "${kw}" (${list.length} occurrences total)`);
  
  // Filter for src/ (user-facing code)
  const srcOccurrences = list.filter(item => item.file.startsWith('src') || item.file === 'index.html' || item.file === 'server.ts');
  console.log(`  - In user-facing / application code (src/, index.html, server.ts): ${srcOccurrences.length}`);
  srcOccurrences.forEach(o => {
    console.log(`    ${o.file}:${o.line} -> ${o.snippet.substring(0, 100)}`);
  });
}
