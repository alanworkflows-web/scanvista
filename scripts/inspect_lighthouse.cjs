const fs = require('fs');
const path = require('path');

const reportPath = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97/lighthouse_report.json');
if (fs.existsSync(reportPath)) {
  const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  console.log('--- ACCESSIBILITY AUDITS WITH SCORE < 1 ---');
  for (const [key, audit] of Object.entries(data.audits)) {
    if (audit.score !== null && audit.score < 1 && data.categories.accessibility.auditRefs.some(r => r.id === key)) {
      console.log(`[${key}] score: ${audit.score} - ${audit.title}: ${audit.explanation || audit.displayValue || ''}`);
    }
  }
  console.log('\n--- BEST PRACTICES AUDITS WITH SCORE < 1 ---');
  for (const [key, audit] of Object.entries(data.audits)) {
    if (audit.score !== null && audit.score < 1 && data.categories['best-practices'].auditRefs.some(r => r.id === key)) {
      console.log(`[${key}] score: ${audit.score} - ${audit.title}: ${audit.explanation || audit.displayValue || ''}`);
    }
  }
  console.log('\n--- SEO AUDITS WITH SCORE < 1 ---');
  for (const [key, audit] of Object.entries(data.audits)) {
    if (audit.score !== null && audit.score < 1 && data.categories.seo.auditRefs.some(r => r.id === key)) {
      console.log(`[${key}] score: ${audit.score} - ${audit.title}: ${audit.explanation || audit.displayValue || ''}`);
    }
  }
}
