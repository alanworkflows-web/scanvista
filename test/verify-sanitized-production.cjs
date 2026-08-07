const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97';

async function verifySanitizedProduction() {
  console.log("=== STARTING SANITIZED PRODUCTION VERIFICATION ===");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Authenticate manager session
  console.log("1. Authenticating manager session...");
  await page.goto('https://scanvista.vercel.app/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home', {
    waitUntil: 'networkidle2'
  });

  // 2. Fetch and verify all production APIs
  console.log("2. Fetching production API responses...");
  const apiResults = await page.evaluate(async () => {
    const fetchApi = async (url) => {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      return { status: res.status, ok: res.ok, data: await res.json() };
    };

    const publicProp = await fetchApi('/api/properties/fishstaurant');
    const publicGuest = await fetchApi('/api/guests/fishstaurant');
    const preview = await fetchApi('/api/preview/7e9e0ecb691e214942c30d86082d3fd0');
    const currentProp = await fetchApi('/api/manager/current-property');
    const guests = await fetchApi('/api/manager/properties/fishstaurant/guests');

    return {
      publicProp,
      publicGuest,
      preview,
      currentProp,
      guests
    };
  });

  console.log("\n--- API VERIFICATION RESULTS ---");
  console.log("Public Property API Status:", apiResults.publicProp.status);
  console.log("Public Guest API Status:", apiResults.publicGuest.status);
  console.log("Owner Preview API Status:", apiResults.preview.status);
  console.log("Manager Current-Property API Status:", apiResults.currentProp.status);
  console.log("Guests Count in Manager API:", apiResults.guests.data?.length);

  // Write API response artifact
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'sanitized_production_apis.json'),
    JSON.stringify(apiResults, null, 2)
  );

  // 3. Capture Screenshots and Inspect DOM of All Relevant Pages
  const pagesToTest = [
    { name: 'sanitized_public_property', url: 'https://scanvista.vercel.app/p/fishstaurant' },
    { name: 'sanitized_public_guest', url: 'https://scanvista.vercel.app/g/fishstaurant' },
    { name: 'sanitized_owner_preview', url: 'https://scanvista.vercel.app/preview/7e9e0ecb691e214942c30d86082d3fd0' },
    { name: 'sanitized_manager_home', url: 'https://scanvista.vercel.app/manager/home' },
    { name: 'sanitized_manager_property', url: 'https://scanvista.vercel.app/manager/property' },
    { name: 'sanitized_manager_amenities', url: 'https://scanvista.vercel.app/manager/amenities' },
    { name: 'sanitized_manager_menu', url: 'https://scanvista.vercel.app/manager/menu' },
    { name: 'sanitized_manager_checklist', url: 'https://scanvista.vercel.app/manager/checklist' },
    { name: 'sanitized_manager_publishing', url: 'https://scanvista.vercel.app/manager/publishing' }
  ];

  const domAudits = [];

  for (const p of pagesToTest) {
    console.log(`\nNavigating to ${p.url}...`);
    await page.goto(p.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const screenshotPath = path.join(ARTIFACTS_DIR, `${p.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot: ${p.name}.png`);

    const pageText = await page.evaluate(() => document.body.innerText);
    const forbiddenTerms = ['alan', 'alwin', 'pintrest', '555-01', 'QA Test', 'QA Spa', 'QA Reading Room', 'bf', 'lunch'];
    const matches = forbiddenTerms.filter(term => pageText.toLowerCase().includes(term.toLowerCase()));

    domAudits.push({
      page: p.name,
      url: p.url,
      forbiddenMatchesFound: matches,
      clean: matches.length === 0
    });
  }

  await browser.close();

  console.log("\n--- DOM AUDIT RESULTS ---");
  console.table(domAudits);

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'sanitized_dom_audits.json'),
    JSON.stringify(domAudits, null, 2)
  );

  console.log("=== VERIFICATION COMPLETE ===");
}

verifySanitizedProduction().catch(console.error);
