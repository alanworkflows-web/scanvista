import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
const keys = env.split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'))
  .map(l => l.split('=')[0]);
console.log('ENV KEYS:', keys.join(', '));
