const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

const artifactDir = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97';
const PROD_URL = 'https://scanvista.vercel.app';
const SLUG = 'fishstaurant';

async function runVercelVerification() {
  console.log("================================================================================");
  console.log(`VERIFYING PRODUCTION DEPLOYMENT ON ${PROD_URL} FOR SLUG: "${SLUG}"`);
  console.log("================================================================================\n");

  // 1. Check Database Property
  const dbProperty = await prisma.property.findUnique({
    where: { slug: SLUG },
    include: {
      categories: { include: { dishes: true } },
      amenities: true,
      org: true,
      snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
    }
  });

  console.log("1. DATABASE VERIFICATION FOR 'fishstaurant':");
  console.log(`   Property ID: ${dbProperty ? dbProperty.id : 'NOT FOUND'}`);
  console.log(`   Property Name: ${dbProperty ? dbProperty.name : 'N/A'}`);
  console.log(`   Slug in DB: ${dbProperty ? dbProperty.slug : 'N/A'}`);
  console.log(`   Categories count: ${dbProperty ? dbProperty.categories.length : 0}`);
  console.log(`   Dishes count: ${dbProperty ? dbProperty.categories.flatMap(c => c.dishes).length : 0}`);
  console.log(`   Amenities count: ${dbProperty ? dbProperty.amenities.length : 0}`);
  if (dbProperty) {
    console.log("   Current Amenities in DB:");
    dbProperty.amenities.forEach((a, i) => console.log(`     [${i+1}] ${a.name} (Icon: ${a.icon}, Status: ${a.status})`));
  }

  // 2. Launch Headless Chrome
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const networkLogs = [];

  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      networkLogs.push({
        type: 'REQUEST',
        url: req.url(),
        method: req.method(),
        postData: req.postData() || null
      });
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let bodyText = null;
      try { bodyText = await res.text(); } catch (e) {}
      networkLogs.push({
        type: 'RESPONSE',
        url: res.url(),
        status: res.status(),
        body: bodyText
      });
    }
  });

  try {
    // 3. Test Public Guest Landing Page on Vercel
    console.log(`\n2. TESTING PUBLIC GUEST PAGE: ${PROD_URL}/${SLUG}`);
    await page.goto(`${PROD_URL}/${SLUG}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const guestScreenshotPath = path.join(artifactDir, 'vercel_guest_fishstaurant.png');
    await page.screenshot({ path: guestScreenshotPath, fullPage: true });
    console.log(`✔ Captured Guest Page Screenshot: ${guestScreenshotPath}`);

    const guestPageData = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.innerText,
        textSnippets: Array.from(document.querySelectorAll('h1, h2, h3, p')).map(e => e.innerText.trim()).filter(Boolean).slice(0, 10)
      };
    });
    console.log("   Guest Page DOM Details:", guestPageData);

    // 4. Test Public API endpoint directly on Vercel
    console.log(`\n3. TESTING PUBLIC API: ${PROD_URL}/api/properties/${SLUG}`);
    const apiResponse = await page.evaluate(async (url) => {
      const res = await fetch(url);
      const data = await res.json();
      return { status: res.status, data };
    }, `${PROD_URL}/api/properties/${SLUG}`);

    console.log(`   API HTTP Status: ${apiResponse.status}`);
    console.log("   API Response Structure:", {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      slug: apiResponse.data.slug,
      categoriesCount: apiResponse.data.categories?.length,
      amenitiesCount: apiResponse.data.amenities?.length,
      amenitiesSample: apiResponse.data.amenities?.map(a => a.name)
    });

    // 5. Test Manager App / Checklist / Home / Amenities / Publishing on Vercel
    console.log(`\n4. TESTING MANAGER INTERFACE ON VERCEL: ${PROD_URL}/manager/home`);
    
    // Set localStorage active property to fishstaurant
    await page.goto(`${PROD_URL}/manager/home`, { waitUntil: 'domcontentloaded' });
    if (dbProperty) {
      await page.evaluate((propId, propSlug) => {
        localStorage.setItem('scanvista_active_property_id', propId);
        localStorage.setItem('scanvista_active_property_slug', propSlug);
      }, dbProperty.id, dbProperty.slug);
    }

    // A. Manager Home Screenshot
    await page.goto(`${PROD_URL}/manager/home`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const homeScreenshotPath = path.join(artifactDir, 'vercel_manager_home.png');
    await page.screenshot({ path: homeScreenshotPath, fullPage: true });
    console.log(`✔ Captured Manager Home Screenshot: ${homeScreenshotPath}`);

    // B. Manager Checklist Screenshot
    await page.goto(`${PROD_URL}/manager/checklist`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const checklistScreenshotPath = path.join(artifactDir, 'vercel_manager_checklist.png');
    await page.screenshot({ path: checklistScreenshotPath, fullPage: true });
    console.log(`✔ Captured Manager Launch Checklist Screenshot: ${checklistScreenshotPath}`);

    // C. Manager Publishing Screenshot
    await page.goto(`${PROD_URL}/manager/publishing`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const publishingScreenshotPath = path.join(artifactDir, 'vercel_manager_publishing.png');
    await page.screenshot({ path: publishingScreenshotPath, fullPage: true });
    console.log(`✔ Captured Manager Publishing Screenshot: ${publishingScreenshotPath}`);

    // D. Manager Amenities Screenshot
    await page.goto(`${PROD_URL}/manager/amenities`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const amenitiesScreenshotPath = path.join(artifactDir, 'vercel_manager_amenities.png');
    await page.screenshot({ path: amenitiesScreenshotPath, fullPage: true });
    console.log(`✔ Captured Manager Amenities Screenshot: ${amenitiesScreenshotPath}`);

    console.log("\n================================================================================");
    console.log("NETWORK LOGS RECORDED FROM VERCEL:");
    console.log("================================================================================");
    networkLogs.forEach(log => {
      if (log.type === 'REQUEST') {
        console.log(`[REQ] ${log.method} ${log.url}`);
        if (log.postData) console.log(`      Payload: ${log.postData.slice(0, 120)}...`);
      } else {
        console.log(`[RES] ${log.status} ${log.url}`);
        if (log.body) console.log(`      Body: ${log.body.slice(0, 150)}...`);
      }
    });

  } catch (err) {
    console.error("Vercel verification error:", err);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runVercelVerification();
