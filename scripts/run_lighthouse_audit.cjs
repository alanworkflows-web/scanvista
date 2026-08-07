const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
const reportPath = path.join(ARTIFACT_DIR, 'lighthouse_report.json');

async function runLighthouse() {
  console.log('[Lighthouse] Running audit on http://127.0.0.1:3000/ ...');
  try {
    const cmd = `npx.cmd lighthouse http://127.0.0.1:3000/ --output=json --output-path="${reportPath}" --chrome-flags="--headless --no-sandbox --disable-setuid-sandbox" --only-categories=performance,accessibility,best-practices,seo`;
    execSync(cmd, { stdio: 'inherit' });

    if (fs.existsSync(reportPath)) {
      const raw = fs.readFileSync(reportPath, 'utf8');
      const data = JSON.parse(raw);
      const scores = {
        performance: Math.round((data.categories.performance?.score || 0) * 100),
        accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((data.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((data.categories.seo?.score || 0) * 100)
      };
      console.log('\n[Lighthouse Audit Scores]:');
      console.log(`  Performance:    ${scores.performance}/100`);
      console.log(`  Accessibility:  ${scores.accessibility}/100`);
      console.log(`  Best Practices: ${scores.bestPractices}/100`);
      console.log(`  SEO:            ${scores.seo}/100`);

      const summaryPath = path.join(ARTIFACT_DIR, 'lighthouse_summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(scores, null, 2));
      console.log(`[Scores Saved] ${summaryPath}`);
    }
  } catch (err) {
    console.error('[Lighthouse Audit Error]:', err.message);
  }
}

runLighthouse();
