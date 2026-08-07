const fs = require('fs');
const path = require('path');

const reportPath = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97/lighthouse_report.json');
const summaryPath = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97/lighthouse_summary.json');

if (fs.existsSync(reportPath)) {
  const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const scores = {
    performance: Math.round((data.categories.performance?.score || 0) * 100),
    accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((data.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((data.categories.seo?.score || 0) * 100),
    auditedUrl: data.finalUrl || 'http://127.0.0.1:3000/',
    fetchTime: data.fetchTime
  };
  fs.writeFileSync(summaryPath, JSON.stringify(scores, null, 2));
  console.log('[Lighthouse Summary Generated]:', scores);
}
