const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyStreamlinedOnboarding() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    steps: [],
    clicks: 0,
    startTime: Date.now()
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 2 });

    // Step 1: Landing Page
    console.log('[E2E 1] Landing Page...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_step1_landing.png'), fullPage: true });
    results.steps.push('Landing Page Loaded');

    // Click Primary CTA
    console.log('[E2E 2] Clicking Start Free for a Few Weeks...');
    await page.click('#hero-primary-cta');
    results.clicks++;
    await delay(800);

    // Step 2: Manager Landing (Verify no pricing box, no pre-auth dropdown)
    console.log('[E2E 3] Verifying Manager Landing Screen...');
    const pageContent = await page.content();
    const hasPricingBox = pageContent.includes('$10/Month');
    const hasPreAuthSelect = await page.$('select') !== null;
    console.log(`  -> Has $10/Month pricing box: ${hasPricingBox} (Expected: false)`);
    console.log(`  -> Has pre-auth select dropdown: ${hasPreAuthSelect} (Expected: false)`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_step2_clean_manager_landing.png'), fullPage: true });

    // Authenticate brand new owner
    console.log('[E2E 4] Simulating New Owner Auth...');
    const testEmail = `streamline.owner.${Date.now()}@example.com`;
    await page.goto(`http://127.0.0.1:3000/auth/dev/login?email=${encodeURIComponent(testEmail)}`, { waitUntil: 'networkidle0' });
    results.clicks++;

    // Step 3: Streamlined Onboarding Step 1 (Setup)
    console.log('[E2E 5] Streamlined Onboarding Step 1: Setup...');
    await page.goto('http://127.0.0.1:3000/manager/onboarding', { waitUntil: 'networkidle0' });
    await delay(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_step3_onboarding_step1.png'), fullPage: true });

    // Type property name and select Resort type
    await page.type('input[placeholder*="Sunset Bay"]', 'Azure Paradise Resort & Villas');
    const typeCards = await page.$$('.cursor-pointer');
    if (typeCards.length > 1) {
      await typeCards[1].click(); // Resort
      results.clicks++;
    }
    await delay(300);

    // Submit Create Property
    console.log('[E2E 6] Creating Property...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      results.clicks++;
    }
    await delay(1500);

    // Step 4: Instant Win Launch Screen
    console.log('[E2E 7] Verifying Instant Win / Launch Screen...');
    const step2Content = await page.content();
    const hasCongratulations = step2Content.includes('Congratulations! Your Guest Portal is Live');
    const hasLiveGuestPortal = step2Content.includes('Live Guest Portal');
    const hasLiveDemoBadge = step2Content.includes('Live Demo URL');
    console.log(`  -> Has Congratulations headline: ${hasCongratulations} (Expected: true)`);
    console.log(`  -> Has "Live Guest Portal" badge: ${hasLiveGuestPortal} (Expected: true)`);
    console.log(`  -> Has "Live Demo URL" badge: ${hasLiveDemoBadge} (Expected: false)`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_step4_instant_win_launch.png'), fullPage: true });

    // Step 5: Navigate to Dashboard
    console.log('[E2E 8] Navigating to Dashboard...');
    const dashboardButtons = await page.$$('button');
    for (const b of dashboardButtons) {
      const txt = await page.evaluate(el => el.innerText, b);
      if (txt.includes('Dashboard')) {
        await b.click();
        results.clicks++;
        break;
      }
    }
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_step5_dashboard.png'), fullPage: true });

    // Step 6: Publishing Center
    console.log('[E2E 9] Verifying Publishing Center Terminology...');
    await page.goto('http://127.0.0.1:3000/manager/publishing', { waitUntil: 'networkidle0' });
    await delay(1000);
    const pubContent = await page.content();
    const hasYourPropertyReady = pubContent.includes('Your property is ready for guests');
    const hasRestaurantReady = pubContent.includes('Your restaurant is ready for guests');
    console.log(`  -> Has "Your property is ready for guests": ${hasYourPropertyReady} (Expected: true)`);
    console.log(`  -> Has "Your restaurant is ready for guests": ${hasRestaurantReady} (Expected: false)`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_step6_clean_publishing_center.png'), fullPage: true });

    results.durationSeconds = ((Date.now() - results.startTime) / 1000).toFixed(1);
    console.log(`[E2E Complete] Total Clicks: ${results.clicks}, Total Duration: ${results.durationSeconds}s`);
    
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'e2e_onboarding_results.json'), JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('E2E execution failed:', err);
  } finally {
    await browser.close();
  }
}

verifyStreamlinedOnboarding();
