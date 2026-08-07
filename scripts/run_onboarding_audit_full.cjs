const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function auditFullJourney() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 2 });

    // Step 1: Landing
    console.log('[Step 1] Auditing Landing Page...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step1_landing.png'), fullPage: true });

    // Step 2: Auth Landing
    console.log('[Step 2] Auditing Start Free CTA Click...');
    await page.click('#hero-primary-cta');
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step2_manager_landing.png'), fullPage: true });

    // Log into dev session to simulate owner session
    console.log('[Step 3] Logging into dev session...');
    const newOwnerEmail = `audit.owner.${Date.now()}@example.com`;
    await page.goto(`http://127.0.0.1:3000/auth/dev/login?email=${encodeURIComponent(newOwnerEmail)}`, { waitUntil: 'networkidle0' });

    // Step 4: Onboarding
    console.log('[Step 4] Auditing Onboarding Flow...');
    await page.goto('http://127.0.0.1:3000/manager/onboarding', { waitUntil: 'networkidle0' });
    
    // Step 0: Welcome Screen
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step4_0_onboarding_welcome.png'), fullPage: true });
    
    // Click Begin Setup
    const beginBtn = await page.$('button');
    if (beginBtn) await beginBtn.click();
    await delay(600);

    // Step 1: Name
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step4_1_property_name.png'), fullPage: true });
    await page.type('input', 'Sunset Bay Boutique Villa');
    await delay(200);

    // Click Continue
    const contBtn1 = await page.$('button');
    if (contBtn1) await contBtn1.click();
    await delay(600);

    // Step 2: Type
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step4_2_property_type.png'), fullPage: true });
    const typeCards = await page.$$('.cursor-pointer');
    if (typeCards.length > 2) await typeCards[2].click();
    await delay(300);

    const contButtons = await page.$$('button');
    for (const b of contButtons) {
      const txt = await page.evaluate(el => el.innerText, b);
      if (txt.includes('Continue')) {
        await b.click();
        break;
      }
    }
    await delay(600);

    // Step 3: Logo
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step4_3_logo_upload.png'), fullPage: true });
    const skipButtons1 = await page.$$('button');
    for (const b of skipButtons1) {
      const txt = await page.evaluate(el => el.innerText, b);
      if (txt.includes('Skip')) {
        await b.click();
        break;
      }
    }
    await delay(600);

    // Step 4: Hero Atmosphere
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step4_4_hero_atmosphere.png'), fullPage: true });
    const skipButtons2 = await page.$$('button');
    for (const b of skipButtons2) {
      const txt = await page.evaluate(el => el.innerText, b);
      if (txt.includes('Skip') || txt.includes('Create')) {
        await b.click();
        break;
      }
    }
    await delay(2000);

    // Step 5: Success & Checklist
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step4_5_success_checklist.png'), fullPage: true });

    // Step 5: Dashboard
    console.log('[Step 5] Auditing Dashboard (/manager/home)...');
    await page.goto('http://127.0.0.1:3000/manager/home', { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step5_dashboard.png'), fullPage: true });

    // Step 6: Publishing
    console.log('[Step 6] Auditing Publish QR (/manager/publishing)...');
    await page.goto('http://127.0.0.1:3000/manager/publishing', { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_step6_publishing_center.png'), fullPage: true });

    console.log('[Audit Complete] All 6 screens and sub-steps captured successfully.');
  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    await browser.close();
  }
}

auditFullJourney();
