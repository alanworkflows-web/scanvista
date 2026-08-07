const puppeteer = require('puppeteer');
const fs = require('fs');

async function scanProductionData() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Log in
  await page.goto('https://scanvista.vercel.app/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home', { waitUntil: 'networkidle2' });

  const managerData = await page.evaluate(async () => {
    const fetchJson = async (url) => {
      try {
        const res = await fetch(url);
        return { status: res.status, ok: res.ok, data: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    };

    const currentProp = await fetchJson('/api/manager/current-property');
    const fullProp = await fetchJson('/api/manager/properties/fishstaurant');
    const guests = await fetchJson('/api/manager/properties/fishstaurant/guests');
    const snapshots = await fetchJson('/api/manager/properties/fishstaurant/snapshots');
    const publicProp = await fetchJson('/api/properties/fishstaurant');
    const previewToken = currentProp.data?.property?.previewToken;
    const preview = previewToken ? await fetchJson(`/api/preview/${previewToken}`) : null;
    const publicGuest = await fetchJson('/api/guests/fishstaurant');

    return {
      currentProp,
      fullProp,
      guests,
      snapshots,
      publicProp,
      preview,
      publicGuest
    };
  });

  await browser.close();

  console.log(JSON.stringify(managerData, null, 2));
}

scanProductionData().catch(console.error);
