const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
const LOCAL_DIR = path.resolve('c:/Users/alok anand magada/Documents/scanvista/screenshots');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(LOCAL_DIR, { recursive: true });

async function captureAfter() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Screenshot (1366 x 900)
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Check DOM elements
    const heroTitle = await page.$eval('h1', el => el.innerText);
    const navCta = await page.$eval('#hero-nav-cta', el => el.innerText);
    const primaryCta = await page.$eval('#hero-primary-cta', el => el.innerText);
    console.log('[Verified DOM Elements]:');
    console.log('  Hero H1:', heroTitle);
    console.log('  Nav CTA:', navCta);
    console.log('  Primary CTA:', primaryCta);

    const desktopPath = path.join(ARTIFACT_DIR, 'landing_after_desktop.png');
    const localDesktopPath = path.join(LOCAL_DIR, 'landing_after_desktop.png');
    await page.screenshot({ path: desktopPath, fullPage: true });
    await page.screenshot({ path: localDesktopPath, fullPage: true });
    console.log('[Captured After Desktop]', desktopPath);

    // 2. Mobile Screenshot (iPhone 14 / 390 x 844)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
    
    const mobilePath = path.join(ARTIFACT_DIR, 'landing_after_mobile.png');
    const localMobilePath = path.join(LOCAL_DIR, 'landing_after_mobile.png');
    await page.screenshot({ path: mobilePath, fullPage: true });
    await page.screenshot({ path: localMobilePath, fullPage: true });
    console.log('[Captured After Mobile]', mobilePath);

  } catch (err) {
    console.error('Error capturing after screenshots:', err);
  } finally {
    await browser.close();
  }
}

captureAfter();
