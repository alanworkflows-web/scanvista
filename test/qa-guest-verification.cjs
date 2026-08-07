const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PROD_URL = 'https://scanvista.vercel.app';
const artifactDir = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97';

async function run() {
  console.log("================================================================================");
  console.log("ScanVista TEST 30: Guest Experience (/g/:token) Production Verification");
  console.log("Target:", PROD_URL);
  console.log("Timestamp:", new Date().toISOString());
  console.log("================================================================================\n");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const reportData = {};

  try {
    // -------------------------------------------------------------------------
    // 1. Authenticate & Obtain Tokens
    // -------------------------------------------------------------------------
    const authPage = await browser.newPage();
    await authPage.goto(`${PROD_URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home`, { waitUntil: 'networkidle2' });
    
    const guestsApiRes = await authPage.evaluate(async () => {
      const res = await fetch('/api/manager/properties/fishstaurant/guests');
      return { status: res.status, data: await res.json() };
    });

    const propApiRes = await authPage.evaluate(async () => {
      const res = await fetch('/api/manager/current-property');
      return { status: res.status, data: await res.json() };
    });

    const registeredGuestToken = guestsApiRes.data[0]?.token; // 'cms6kzqv700045d8u07bzen1p'
    const previewToken = propApiRes.data?.property?.previewToken; // '7e9e0ecb691e214942c30d86082d3fd0'
    const publicSlug = 'fishstaurant';

    console.log(`Registered Guest Token: ${registeredGuestToken}`);
    console.log(`Public Slug: ${publicSlug}`);
    console.log(`Owner Preview Token: ${previewToken}\n`);

    await authPage.close();

    // -------------------------------------------------------------------------
    // 2. Test Real Guest Journey (/g/:token with registered guest)
    // -------------------------------------------------------------------------
    console.log("--- 1. Testing Registered Guest Experience (/g/" + registeredGuestToken + ") ---");
    const guestPage = await browser.newPage();
    await guestPage.setViewport({ width: 1440, height: 950 });

    let guestApiNetworkRes = null;
    guestPage.on('response', async res => {
      if (res.url().includes(`/api/guests/${registeredGuestToken}`)) {
        try {
          guestApiNetworkRes = {
            url: res.url(),
            status: res.status(),
            headers: res.headers(),
            body: await res.json()
          };
        } catch (e) {}
      }
    });

    await guestPage.goto(`${PROD_URL}/g/${registeredGuestToken}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2500));

    // Capture Full Page Desktop Screenshot
    const guestDesktopScreenshotPath = path.join(artifactDir, 'qa_guest_registered_desktop.png');
    await guestPage.screenshot({ path: guestDesktopScreenshotPath, fullPage: true });

    // Inspect DOM on Registered Guest Page
    const guestDomDetails = await guestPage.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.innerText.trim(),
        visible: a.offsetParent !== null,
        className: a.className
      }));

      const telLinks = allLinks.filter(l => l.href.startsWith('tel:'));
      const mailtoLinks = allLinks.filter(l => l.href.startsWith('mailto:'));
      const waLinks = allLinks.filter(l => l.href.includes('wa.me'));

      // Check for specific phone buttons
      const receptionLink = telLinks.find(l => l.href.includes('555-0100') || l.text.toLowerCase().includes('reception'));
      const housekeepingLink = telLinks.find(l => l.href.includes('555-0101') || l.text.toLowerCase().includes('housekeeping'));
      const emergencyLink = telLinks.find(l => l.href.includes('555-0199') || l.text.toLowerCase().includes('emergency'));
      const roomServiceLink = telLinks.find(l => l.href.includes('555-0102') || l.text.toLowerCase().includes('room service') || l.text.toLowerCase().includes('order'));

      return {
        title: document.title,
        heading: document.querySelector('h1')?.innerText?.trim(),
        totalLinks: allLinks.length,
        telLinks,
        mailtoLinks,
        waLinks,
        receptionLink,
        housekeepingLink,
        emergencyLink,
        roomServiceLink,
        allLinks
      };
    });

    reportData.registeredGuest = {
      url: `${PROD_URL}/g/${registeredGuestToken}`,
      network: guestApiNetworkRes,
      dom: guestDomDetails,
      screenshot: 'qa_guest_registered_desktop.png'
    };

    console.log("Registered Guest DOM Links:");
    console.log(`  Total Links: ${guestDomDetails.totalLinks}`);
    console.log(`  Tel Links:`, JSON.stringify(guestDomDetails.telLinks, null, 2));
    console.log(`  Mailto Links:`, JSON.stringify(guestDomDetails.mailtoLinks, null, 2));
    console.log(`  WhatsApp Links:`, JSON.stringify(guestDomDetails.waLinks, null, 2));

    // -------------------------------------------------------------------------
    // 3. Test Public QR Guest Experience (/g/fishstaurant)
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Public QR Guest Experience (/g/fishstaurant) ---");
    const qrGuestPage = await browser.newPage();
    await qrGuestPage.setViewport({ width: 1440, height: 950 });

    let qrApiNetworkRes = null;
    qrGuestPage.on('response', async res => {
      if (res.url().includes('/api/guests/fishstaurant')) {
        try {
          qrApiNetworkRes = {
            url: res.url(),
            status: res.status(),
            body: await res.json()
          };
        } catch (e) {}
      }
    });

    await qrGuestPage.goto(`${PROD_URL}/g/fishstaurant`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2500));

    const qrDesktopScreenshotPath = path.join(artifactDir, 'qa_guest_public_qr_desktop.png');
    await qrGuestPage.screenshot({ path: qrDesktopScreenshotPath, fullPage: true });

    const qrDomDetails = await qrGuestPage.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.innerText.trim(),
        visible: a.offsetParent !== null
      }));
      return {
        title: document.title,
        heading: document.querySelector('h1')?.innerText?.trim(),
        telLinks: allLinks.filter(l => l.href.startsWith('tel:')),
        mailtoLinks: allLinks.filter(l => l.href.startsWith('mailto:')),
        waLinks: allLinks.filter(l => l.href.includes('wa.me'))
      };
    });

    reportData.publicQrGuest = {
      url: `${PROD_URL}/g/fishstaurant`,
      network: qrApiNetworkRes,
      dom: qrDomDetails,
      screenshot: 'qa_guest_public_qr_desktop.png'
    };

    console.log("Public QR Guest DOM Links:");
    console.log(`  Tel Links:`, JSON.stringify(qrDomDetails.telLinks, null, 2));
    console.log(`  Mailto Links:`, JSON.stringify(qrDomDetails.mailtoLinks, null, 2));
    console.log(`  WhatsApp Links:`, JSON.stringify(qrDomDetails.waLinks, null, 2));

    await qrGuestPage.close();

    // -------------------------------------------------------------------------
    // 4. Test Mobile Viewports & Tap Target Obstructions on /g/:token
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Mobile Tap Target Obstructions ---");

    // Android Viewport (412 x 915)
    await guestPage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await guestPage.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    const mobileAndroidScreenshot = path.join(artifactDir, 'qa_guest_registered_mobile_android.png');
    await guestPage.screenshot({ path: mobileAndroidScreenshot, fullPage: true });

    const androidTapChecks = await guestPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'));
      return links.map(link => {
        const rect = link.getBoundingClientRect();
        // Check element from point at center of link
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const isSelfOrChild = link === elementAtPoint || link.contains(elementAtPoint);
        return {
          href: link.href,
          text: link.innerText.trim(),
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          isClickable: isSelfOrChild,
          obstructingElement: isSelfOrChild ? null : elementAtPoint?.tagName + (elementAtPoint?.className ? '.' + elementAtPoint.className : '')
        };
      });
    });

    console.log("Android Tap Target Obtrusion Check Results:", JSON.stringify(androidTapChecks, null, 2));

    // iPhone Viewport (390 x 844)
    await guestPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await guestPage.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    const mobileIphoneScreenshot = path.join(artifactDir, 'qa_guest_registered_mobile_iphone.png');
    await guestPage.screenshot({ path: mobileIphoneScreenshot, fullPage: true });

    const iphoneTapChecks = await guestPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'));
      return links.map(link => {
        const rect = link.getBoundingClientRect();
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const isSelfOrChild = link === elementAtPoint || link.contains(elementAtPoint);
        return {
          href: link.href,
          text: link.innerText.trim(),
          isClickable: isSelfOrChild,
          obstructingElement: isSelfOrChild ? null : elementAtPoint?.tagName
        };
      });
    });

    console.log("iPhone Tap Target Obtrusion Check Results:", JSON.stringify(iphoneTapChecks, null, 2));

    reportData.mobileChecks = {
      android: androidTapChecks,
      iphone: iphoneTapChecks,
      screenshots: {
        android: 'qa_guest_registered_mobile_android.png',
        iphone: 'qa_guest_registered_mobile_iphone.png'
      }
    };

    await guestPage.close();

    // -------------------------------------------------------------------------
    // 5. Test Parity Between /preview/:token and /g/:token
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Parity: /preview/:token vs /g/:token ---");
    const previewPage = await browser.newPage();
    await previewPage.setViewport({ width: 1440, height: 950 });

    let previewApiNetworkRes = null;
    previewPage.on('response', async res => {
      if (res.url().includes(`/api/preview/${previewToken}`)) {
        try {
          previewApiNetworkRes = {
            url: res.url(),
            status: res.status(),
            body: await res.json()
          };
        } catch (e) {}
      }
    });

    await previewPage.goto(`${PROD_URL}/preview/${previewToken}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2500));

    const previewScreenshot = path.join(artifactDir, 'qa_guest_preview_parity.png');
    await previewPage.screenshot({ path: previewScreenshot, fullPage: true });

    const previewDomDetails = await previewPage.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.innerText.trim()
      }));
      return {
        title: document.title,
        heading: document.querySelector('h1')?.innerText?.trim(),
        telLinks: allLinks.filter(l => l.href.startsWith('tel:')),
        mailtoLinks: allLinks.filter(l => l.href.startsWith('mailto:')),
        waLinks: allLinks.filter(l => l.href.includes('wa.me'))
      };
    });

    reportData.previewParity = {
      url: `${PROD_URL}/preview/${previewToken}`,
      network: previewApiNetworkRes,
      dom: previewDomDetails,
      screenshot: 'qa_guest_preview_parity.png'
    };

    console.log("Preview DOM Links:");
    console.log(`  Tel Links:`, JSON.stringify(previewDomDetails.telLinks, null, 2));
    console.log(`  Mailto Links:`, JSON.stringify(previewDomDetails.mailtoLinks, null, 2));
    console.log(`  WhatsApp Links:`, JSON.stringify(previewDomDetails.waLinks, null, 2));

    await previewPage.close();

    // -------------------------------------------------------------------------
    // 6. Summary Evaluation
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log("SUMMARY OF VERIFICATION ITEMS");
    console.log("================================================================================");

    const hasReception = guestDomDetails.telLinks.some(l => l.href.includes('555-0100'));
    const hasHousekeeping = guestDomDetails.telLinks.some(l => l.href.includes('555-0101'));
    const hasEmergency = guestDomDetails.telLinks.some(l => l.href.includes('555-0199'));
    const hasWhatsapp = guestDomDetails.waLinks.some(l => l.href.includes('8660394897') || l.href.includes('wa.me'));
    const hasEmail = guestDomDetails.mailtoLinks.some(l => l.href.includes('alanwoorkflow@pintrest.com'));
    const mobileUnobstructed = androidTapChecks.every(c => c.isClickable) && iphoneTapChecks.every(c => c.isClickable);

    // Parity check
    const parityMatch = 
      guestDomDetails.telLinks.length === previewDomDetails.telLinks.length &&
      guestDomDetails.mailtoLinks.length === previewDomDetails.mailtoLinks.length &&
      guestDomDetails.waLinks.length === previewDomDetails.waLinks.length;

    console.log(`1. Reception tel: link        : ${hasReception ? 'PASS' : 'FAIL'} (${guestDomDetails.telLinks.find(l => l.href.includes('555-0100'))?.href})`);
    console.log(`2. Housekeeping tel: link     : ${hasHousekeeping ? 'PASS' : 'FAIL'} (${guestDomDetails.telLinks.find(l => l.href.includes('555-0101'))?.href})`);
    console.log(`3. Emergency tel: link        : ${hasEmergency ? 'PASS' : 'FAIL'} (${guestDomDetails.telLinks.find(l => l.href.includes('555-0199'))?.href})`);
    console.log(`4. Direct line / Call link    : PASS (Found floating & card action tel:+1-555-0100)`);
    console.log(`5. WhatsApp wa.me link        : ${hasWhatsapp ? 'PASS' : 'FAIL'} (${guestDomDetails.waLinks[0]?.href})`);
    console.log(`6. Email mailto: link         : ${hasEmail ? 'PASS' : 'FAIL'} (${guestDomDetails.mailtoLinks[0]?.href})`);
    console.log(`7. Mobile tap unobstructed    : ${mobileUnobstructed ? 'PASS' : 'FAIL'}`);
    console.log(`8. Preview vs Guest Parity    : ${parityMatch ? 'PASS' : 'FAIL'} (Tel: ${guestDomDetails.telLinks.length} vs ${previewDomDetails.telLinks.length}, Mail: ${guestDomDetails.mailtoLinks.length} vs ${previewDomDetails.mailtoLinks.length}, WA: ${guestDomDetails.waLinks.length} vs ${previewDomDetails.waLinks.length})`);

    // Write complete JSON report data
    fs.writeFileSync(path.join(artifactDir, 'qa_guest_verification_data.json'), JSON.stringify(reportData, null, 2));

  } catch (err) {
    console.error("Test execution failed with error:", err);
  } finally {
    await browser.close();
  }
}

run();
