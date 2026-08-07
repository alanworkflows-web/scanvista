const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const artifactDir = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97';
const PROD_URL = 'https://scanvista.vercel.app';
const SLUG = 'fishstaurant';

async function verifyProduction() {
  console.log("================================================================================");
  console.log(`VERIFYING PRODUCTION URLS & APIS FOR PROPERTY: "${SLUG}"`);
  console.log("================================================================================\n");

  const prop = await prisma.property.findUnique({
    where: { slug: SLUG },
    include: {
      categories: { include: { dishes: true } },
      amenities: true,
      snapshots: { orderBy: { publishedAt: 'desc' }, take: 1 }
    }
  });

  console.log("1. DATABASE SNAPSHOT FOR 'fishstaurant':");
  console.log(`   ID: ${prop.id}`);
  console.log(`   Name: ${prop.name}`);
  console.log(`   Slug: ${prop.slug}`);
  console.log(`   Preview Token: ${prop.previewToken}`);
  console.log(`   Categories: ${prop.categories.length}`);
  console.log(`   Dishes: ${prop.categories.flatMap(c => c.dishes).length}`);
  console.log(`   Amenities (${prop.amenities.length}):`);
  prop.amenities.forEach((a, i) => {
    console.log(`     [${i+1}] ID: ${a.id} | Name: "${a.name}" | Icon: "${a.icon}" | Status: ${a.status}`);
  });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const networkEntries = [];

  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      networkEntries.push({
        type: 'REQUEST',
        url: req.url(),
        method: req.method(),
        postData: req.postData() || null
      });
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      networkEntries.push({
        type: 'RESPONSE',
        url: res.url(),
        status: res.status(),
        body: body
      });
    }
  });

  try {
    // 2. Test Public Property Page (/p/fishstaurant)
    const publicUrl = `${PROD_URL}/p/${SLUG}`;
    console.log(`\n2. TESTING PUBLIC PROPERTY PAGE: ${publicUrl}`);
    await page.goto(publicUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const publicScreenshot = path.join(artifactDir, 'vercel_public_fishstaurant.png');
    await page.screenshot({ path: publicScreenshot, fullPage: true });
    console.log(`✔ Screenshot saved: ${publicScreenshot}`);

    const publicPageData = await page.evaluate(() => {
      return {
        h1: document.querySelector('h1')?.innerText,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean),
        cardsCount: document.querySelectorAll('.rounded-xl, .shadow-sm, [role="article"]').length
      };
    });
    console.log("   Public Page DOM Extraction:", publicPageData);

    // 3. Test Preview Page (/preview/:token)
    if (prop.previewToken) {
      const previewUrl = `${PROD_URL}/preview/${prop.previewToken}`;
      console.log(`\n3. TESTING GUEST PREVIEW PAGE: ${previewUrl}`);
      await page.goto(previewUrl, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));

      const previewScreenshot = path.join(artifactDir, 'vercel_preview_fishstaurant.png');
      await page.screenshot({ path: previewScreenshot, fullPage: true });
      console.log(`✔ Screenshot saved: ${previewScreenshot}`);

      const previewPageData = await page.evaluate(() => {
        return {
          h1: document.querySelector('h1')?.innerText,
          headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean),
          amenitiesSection: Array.from(document.querySelectorAll('h2, h3')).map(h => h.innerText).filter(t => t.toLowerCase().includes('amenit') || t.toLowerCase().includes('service'))
        };
      });
      console.log("   Preview Page DOM Extraction:", previewPageData);
    }

    // 4. Test Production API Response (GET /api/properties/fishstaurant)
    console.log(`\n4. TESTING PRODUCTION API: ${PROD_URL}/api/properties/${SLUG}`);
    const apiRes = await page.evaluate(async (url) => {
      const r = await fetch(url);
      const data = await r.json();
      return {
        status: r.status,
        headers: Object.fromEntries(r.headers.entries()),
        data
      };
    }, `${PROD_URL}/api/properties/${SLUG}`);

    console.log(`   Status: ${apiRes.status}`);
    console.log("   Property Payload:", {
      id: apiRes.data.property?.id,
      name: apiRes.data.property?.name,
      slug: apiRes.data.property?.slug,
      isPublished: apiRes.data.property?.isPublished,
      categoriesCount: apiRes.data.categories?.length,
      dishesCount: apiRes.data.dishes?.length,
      amenitiesCount: apiRes.data.amenities?.length,
      amenities: apiRes.data.amenities?.map(a => ({ id: a.id, name: a.name, icon: a.icon, status: a.status }))
    });

    console.log("\n================================================================================");
    console.log("5. DEVTOOLS NETWORK LOGS:");
    console.log("================================================================================");
    networkEntries.forEach((entry, idx) => {
      if (entry.type === 'REQUEST') {
        console.log(`[${idx+1}] REQ: ${entry.method} ${entry.url}`);
      } else {
        console.log(`[${idx+1}] RES: HTTP ${entry.status} ${entry.url}`);
        if (entry.body && entry.body.length < 300) {
          console.log(`     Body: ${entry.body}`);
        } else if (entry.body) {
          console.log(`     Body (truncated): ${entry.body.slice(0, 250)}...`);
        }
      }
    });

  } catch (err) {
    console.error("Verification Error:", err);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

verifyProduction();
