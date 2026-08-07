const puppeteer = require('puppeteer');
const path = require('path');

const artifactDir = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97';
const PROD_URL = 'https://scanvista.vercel.app';

async function verifyManagerProduction() {
  console.log("================================================================================");
  console.log("LOGGING INTO PRODUCTION MANAGER FOR FISHSTAURANT & CAPTURING UI & API EVIDENCE");
  console.log("================================================================================\n");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  let currentPropertyApiResponse = null;

  page.on('response', async (res) => {
    if (res.url().includes('/api/manager/current-property')) {
      try {
        const text = await res.text();
        currentPropertyApiResponse = JSON.parse(text);
      } catch (e) {}
    }
  });

  try {
    // 1. Authenticate via verify-session
    const authUrl = `${PROD_URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home`;
    console.log(`1. Authenticating on Vercel: ${authUrl}`);
    const authRes = await page.goto(authUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`   Auth Navigation Status: ${authRes.status()} -> Final URL: ${page.url()}`);
    await new Promise(r => setTimeout(r, 2000));

    // 2. Capture /manager/home
    console.log(`\n2. CAPTURING /manager/home`);
    await page.goto(`${PROD_URL}/manager/home`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const homeScreenshot = path.join(artifactDir, 'vercel_manager_home_prod.png');
    await page.screenshot({ path: homeScreenshot, fullPage: true });
    console.log(`✔ Screenshot saved: ${homeScreenshot}`);

    const homeUiData = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        h1: document.querySelector('h1')?.innerText,
        text: document.body.innerText.slice(0, 500)
      };
    });
    console.log("   Home DOM Sample:", homeUiData);

    // 3. Capture /manager/checklist
    console.log(`\n3. CAPTURING /manager/checklist`);
    await page.goto(`${PROD_URL}/manager/checklist`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const checklistScreenshot = path.join(artifactDir, 'vercel_manager_checklist_prod.png');
    await page.screenshot({ path: checklistScreenshot, fullPage: true });
    console.log(`✔ Screenshot saved: ${checklistScreenshot}`);

    const checklistUiData = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        h1: document.querySelector('h1')?.innerText,
        text: document.body.innerText.slice(0, 500)
      };
    });
    console.log("   Checklist DOM Sample:", checklistUiData);

    // 4. Capture /manager/publishing
    console.log(`\n4. CAPTURING /manager/publishing`);
    await page.goto(`${PROD_URL}/manager/publishing`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const publishingScreenshot = path.join(artifactDir, 'vercel_manager_publishing_prod.png');
    await page.screenshot({ path: publishingScreenshot, fullPage: true });
    console.log(`✔ Screenshot saved: ${publishingScreenshot}`);

    const publishingUiData = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        h1: document.querySelector('h1')?.innerText,
        text: document.body.innerText.slice(0, 500)
      };
    });
    console.log("   Publishing DOM Sample:", publishingUiData);

    // 5. Inspect API Response
    console.log("\n================================================================================");
    console.log("5. GET /api/manager/current-property API RESPONSE:");
    console.log("================================================================================");
    if (currentPropertyApiResponse) {
      console.log(JSON.stringify({
        property: {
          id: currentPropertyApiResponse.property?.id,
          name: currentPropertyApiResponse.property?.name,
          slug: currentPropertyApiResponse.property?.slug,
          isPublished: currentPropertyApiResponse.property?.isPublished
        },
        status: {
          completionPercentage: currentPropertyApiResponse.status?.completionPercentage,
          completedCount: currentPropertyApiResponse.status?.completedCount,
          totalCount: currentPropertyApiResponse.status?.totalCount,
          isReady: currentPropertyApiResponse.status?.isReady,
          publishState: currentPropertyApiResponse.status?.publishState,
          items: currentPropertyApiResponse.status?.items?.map(i => ({ id: i.id, label: i.label, completed: i.completed }))
        }
      }, null, 2));
    } else {
      console.log("Response not captured in network listener, fetching directly...");
    }

  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyManagerProduction();
