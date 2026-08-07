const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDetailedCheck() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 2 });

  // 1. Dev login
  const testEmail = `streamline.${Date.now()}@example.com`;
  console.log('Logging in with:', testEmail);
  await page.goto(`http://127.0.0.1:3000/auth/dev/login?email=${encodeURIComponent(testEmail)}`, { waitUntil: 'networkidle0' });

  // 2. Go to /manager/onboarding
  await page.goto('http://127.0.0.1:3000/manager/onboarding', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'detailed_step1_setup.png') });

  // 3. Fill name and click Resort
  await page.type('input[placeholder*="Sunset Bay"]', 'Villa Serene Retreat');
  await delay(300);

  // Click submit button
  console.log('Clicking Create Property button...');
  await page.click('button[type="submit"]');
  
  // Wait for step 2 headline
  await page.waitForFunction(() => document.body.innerText.includes('Congratulations! Your Guest Portal is Live'), { timeout: 10000 });
  await delay(1000);

  console.log('Step 2 is visible!');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'detailed_step2_congratulations.png') });

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Contains Congratulations:', text.includes('Congratulations! Your Guest Portal is Live'));
  console.log('Contains Live Guest Portal:', text.includes('Live Guest Portal'));
  console.log('Contains Add Amenities & WiFi:', text.includes('Add Amenities & WiFi'));
  console.log('Contains Add Property Menu:', text.includes('Add Property Menu'));

  // 4. Go to Publishing Center
  await page.goto('http://127.0.0.1:3000/manager/publishing', { waitUntil: 'networkidle0' });
  await delay(1500);
  const pubText = await page.evaluate(() => document.body.innerText);
  console.log('Publishing contains "Your property is ready for guests":', pubText.includes('Your property is ready for guests'));
  console.log('Publishing contains "Property Readiness":', pubText.includes('Property Readiness'));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'detailed_step3_publishing.png') });

  await browser.close();
}

runDetailedCheck().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
