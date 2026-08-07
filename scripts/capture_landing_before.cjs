const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function captureBefore() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Screenshot
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
    const desktopPath = path.join(ARTIFACT_DIR, 'landing_before_desktop.png');
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log('[Captured]', desktopPath);

    // 2. Mobile Screenshot (iPhone 14 / modern standard)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
    const mobilePath = path.join(ARTIFACT_DIR, 'landing_before_mobile.png');
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log('[Captured]', mobilePath);

  } catch (err) {
    console.error('Error capturing before screenshots:', err);
  } finally {
    await browser.close();
  }
}

captureBefore();
