/**
 * ScanVista P0 QA Suite — Phase 7-10 (Tests 30-42)
 * Continues from the halted suite, testing guest links on /preview/:token
 * and completing the remaining phases.
 */
const puppeteer = require('puppeteer');
const path = require('path');

const PROD_URL = 'https://scanvista.vercel.app';
const SLUG = 'fishstaurant';
const artifactDir = 'C:\\Users\\alok anand magada\\.gemini\\antigravity\\brain\\44f6329e-f5a4-4d6c-b171-cd287adbbb97';

const results = [];
let testNumber = 29; // Continue from TEST 30
let failed = false;

function record(action, request, responseCode, browserResult, pass) {
  testNumber++;
  const result = { test: testNumber, action, request, responseCode, browserResult, result: pass ? 'PASS' : 'FAIL' };
  results.push(result);
  const icon = pass ? '✔' : '✘';
  console.log(`${icon} TEST ${testNumber}: ${action} | ${request} | ${responseCode} | ${browserResult} | ${result.result}`);
  if (!pass) failed = true;
  return pass;
}

async function apiCall(page, method, urlPath, body) {
  return page.evaluate(async ({ method, path, body }) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { try { data = await res.text(); } catch (_) {} }
    return { status: res.status, data };
  }, { method, path: urlPath, body });
}

async function run() {
  console.log("================================================================================");
  console.log("ScanVista P0 QA Suite — Tests 30-42 (Continuation)");
  console.log("Target: https://scanvista.vercel.app | Property: fishstaurant");
  console.log(`Started: ${new Date().toISOString()}`);
  console.log("================================================================================\n");

  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  try {
    // Authenticate
    await page.goto(`${PROD_URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Get preview token
    const propRes = await apiCall(page, 'GET', '/api/manager/current-property');
    const previewToken = propRes.data?.property?.previewToken;
    console.log(`Preview token: ${previewToken}\n`);

    // =========================================================================
    // PHASE 7 — GUEST ASSISTANCE (on /preview/:token where links exist)
    // =========================================================================
    console.log("--- PHASE 7: GUEST ASSISTANCE (via /preview/:token) ---\n");

    // TEST 30: Guest page phone/contact links on preview route
    await page.goto(`${PROD_URL}/preview/${previewToken}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    // Take screenshot of the full guest page
    const guestScreenshot = path.join(artifactDir, 'qa_guest_preview_page.png');
    await page.screenshot({ path: guestScreenshot, fullPage: true });

    // Scan all <a> elements in the DOM (including inside collapsed accordions)
    const guestButtons = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return {
        telLinks: links.filter(l => l.href && l.href.startsWith('tel:')).map(l => ({ href: l.href, text: l.innerText?.trim() })),
        mailLinks: links.filter(l => l.href && l.href.startsWith('mailto:')).map(l => ({ href: l.href, text: l.innerText?.trim() })),
        waLinks: links.filter(l => l.href && l.href.includes('wa.me')).map(l => ({ href: l.href, text: l.innerText?.trim() })),
        allLinks: links.map(l => l.href).filter(h => h),
        totalLinkCount: links.length
      };
    });

    console.log(`  DOM scan results: tel=${guestButtons.telLinks.length}, mailto=${guestButtons.mailLinks.length}, wa=${guestButtons.waLinks.length}`);
    if (guestButtons.telLinks.length > 0) console.log(`  tel: links: ${JSON.stringify(guestButtons.telLinks)}`);
    if (guestButtons.mailLinks.length > 0) console.log(`  mailto: links: ${JSON.stringify(guestButtons.mailLinks)}`);
    if (guestButtons.waLinks.length > 0) console.log(`  wa.me links: ${JSON.stringify(guestButtons.waLinks)}`);

    if (!record(
      "Guest preview phone/contact link verification",
      `DOM scan on /preview/${previewToken}`,
      'N/A (DOM)',
      `tel: ${guestButtons.telLinks.length}, mailto: ${guestButtons.mailLinks.length}, wa: ${guestButtons.waLinks.length}`,
      guestButtons.telLinks.length > 0
    )) {
      // If preview also has no links, try expanding accordions
      console.log("  Attempting to expand all accordion sections...");
      await page.evaluate(() => {
        document.querySelectorAll('button').forEach(btn => {
          const text = btn.innerText?.toLowerCase() || '';
          if (text.includes('assistance') || text.includes('contact') || text.includes('info') || text.includes('stay')) {
            btn.click();
          }
        });
      });
      await new Promise(r => setTimeout(r, 1000));
      
      const afterExpand = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return {
          telLinks: links.filter(l => l.href && l.href.startsWith('tel:')).map(l => ({ href: l.href, text: l.innerText?.trim() })),
          mailLinks: links.filter(l => l.href && l.href.startsWith('mailto:')).map(l => ({ href: l.href, text: l.innerText?.trim() })),
          waLinks: links.filter(l => l.href && l.href.includes('wa.me')).map(l => ({ href: l.href, text: l.innerText?.trim() })),
        };
      });
      console.log(`  After expanding accordions: tel=${afterExpand.telLinks.length}, mailto=${afterExpand.mailLinks.length}, wa=${afterExpand.waLinks.length}`);
      if (afterExpand.telLinks.length > 0) console.log(`  tel: links after expand: ${JSON.stringify(afterExpand.telLinks)}`);
      
      const expandScreenshot = path.join(artifactDir, 'qa_guest_preview_expanded.png');
      await page.screenshot({ path: expandScreenshot, fullPage: true });
      console.log(`  Screenshot after expand: ${expandScreenshot}`);
      
      // If still no links, this is a real issue
      if (afterExpand.telLinks.length === 0) {
        console.log("\n  FAILURE EVIDENCE: Zero tel: links even after expanding all accordions.");
        console.log("  This indicates phone numbers are not being rendered on the guest preview page.");
        await finish(browser);
        return;
      }
    }

    // TEST 31: Verify tel: URI contains correct phone number
    const telHrefs = guestButtons.telLinks.length > 0 ? guestButtons.telLinks : 
      (await page.evaluate(() => Array.from(document.querySelectorAll('a')).filter(l => l.href?.startsWith('tel:')).map(l => ({ href: l.href }))));
    
    const hasTelCorrect = telHrefs.some(t => t.href?.includes('555-0100'));
    if (!record(
      "Verify tel: URI contains reception phone (+1-555-0100)",
      'DOM href check on preview page',
      'N/A',
      hasTelCorrect ? `Found: ${telHrefs[0]?.href}` : `No match in: ${telHrefs.map(t => t.href).join(', ')}`,
      hasTelCorrect
    )) { await finish(browser); return; }

    // TEST 30b: Also verify /p/:slug page renders property content correctly
    await page.goto(`${PROD_URL}/p/${SLUG}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const propertyPageScreenshot = path.join(artifactDir, 'qa_property_page.png');
    await page.screenshot({ path: propertyPageScreenshot, fullPage: true });
    
    const ppContent = await page.evaluate(() => {
      return {
        hasPropertyName: document.body.innerText.includes('fishstaurant'),
        h1Text: document.querySelector('h1')?.innerText || 'none',
        hasMenu: document.body.innerText.toLowerCase().includes('menu'),
        hasAmenities: document.body.innerText.toLowerCase().includes('amenit')
      };
    });
    if (!record(
      "PropertyPage (/p/:slug) renders property content",
      `Browser navigate /p/${SLUG}`,
      'N/A (DOM)',
      `Name: ${ppContent.hasPropertyName}, Menu: ${ppContent.hasMenu}, Amenities: ${ppContent.hasAmenities}`,
      ppContent.hasPropertyName || ppContent.hasMenu
    )) { await finish(browser); return; }

    // =========================================================================
    // PHASE 8 — MOBILE VIEWPORT
    // =========================================================================
    console.log("\n--- PHASE 8: MOBILE VIEWPORT ---\n");

    // TEST 33: Android Chrome viewport on guest page
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto(`${PROD_URL}/preview/${previewToken}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const mobileGuestScreenshot = path.join(artifactDir, 'qa_mobile_guest_android.png');
    await page.screenshot({ path: mobileGuestScreenshot, fullPage: true });
    const mobileGuestCheck = await page.evaluate(() => ({
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    if (!record(
      "Guest preview on Android (412×915) — no horizontal scroll",
      `Viewport /preview/:token`,
      'N/A (DOM)',
      mobileGuestCheck.hasHorizontalScroll ? `SCROLL: body=${mobileGuestCheck.bodyWidth}` : `No scroll. body=${mobileGuestCheck.bodyWidth}`,
      !mobileGuestCheck.hasHorizontalScroll
    )) { await finish(browser); return; }

    // TEST 34: iPhone Safari viewport on guest page
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${PROD_URL}/preview/${previewToken}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const iphoneGuestScreenshot = path.join(artifactDir, 'qa_mobile_guest_iphone.png');
    await page.screenshot({ path: iphoneGuestScreenshot, fullPage: true });
    const iphoneGuestCheck = await page.evaluate(() => ({
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    if (!record(
      "Guest preview on iPhone (390×844) — no horizontal scroll",
      `Viewport /preview/:token`,
      'N/A (DOM)',
      iphoneGuestCheck.hasHorizontalScroll ? `SCROLL: body=${iphoneGuestCheck.bodyWidth}` : `No scroll. body=${iphoneGuestCheck.bodyWidth}`,
      !iphoneGuestCheck.hasHorizontalScroll
    )) { await finish(browser); return; }

    // TEST 35: PropertyPage on mobile
    await page.goto(`${PROD_URL}/p/${SLUG}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const mobilePropScreenshot = path.join(artifactDir, 'qa_mobile_property_page.png');
    await page.screenshot({ path: mobilePropScreenshot, fullPage: true });
    const mobilePropCheck = await page.evaluate(() => ({
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    if (!record(
      "PropertyPage on mobile (390×844) — no horizontal scroll",
      `Viewport /p/${SLUG}`,
      'N/A (DOM)',
      mobilePropCheck.hasHorizontalScroll ? `SCROLL: body=${mobilePropCheck.bodyWidth}` : `No scroll. body=${mobilePropCheck.bodyWidth}`,
      !mobilePropCheck.hasHorizontalScroll
    )) { await finish(browser); return; }

    // TEST 36: Manager on mobile
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto(`${PROD_URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.goto(`${PROD_URL}/manager/home`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const mgrMobileScreenshot = path.join(artifactDir, 'qa_mobile_manager.png');
    await page.screenshot({ path: mgrMobileScreenshot, fullPage: true });
    const mgrMobileCheck = await page.evaluate(() => ({
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    if (!record(
      "Manager home on mobile (412×915) — no horizontal scroll",
      "Viewport /manager/home",
      'N/A (DOM)',
      mgrMobileCheck.hasHorizontalScroll ? `SCROLL: body=${mgrMobileCheck.bodyWidth}` : `No scroll`,
      !mgrMobileCheck.hasHorizontalScroll
    )) { await finish(browser); return; }

    // Reset to desktop
    await page.setViewport({ width: 1440, height: 950 });

    // =========================================================================
    // PHASE 9 — ANALYTICS
    // =========================================================================
    console.log("\n--- PHASE 9: ANALYTICS ---\n");

    await page.goto(`${PROD_URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&returnTo=/manager/home`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const propId = propRes.data?.property?.id;

    // TEST 37: Post analytics event
    const analyticsRes = await apiCall(page, 'POST', '/api/tracking/event', {
      propertyId: propId,
      action: 'VIEWED',
      resourceType: 'PROPERTY',
      source: 'QR',
      metadata: { test: 'P0 QA continuation' }
    });
    if (!record(
      "Post analytics event (QR scan simulation)",
      "POST /api/tracking/event",
      `${analyticsRes.status}`,
      (analyticsRes.status === 200 || analyticsRes.status === 201) ? 'Event recorded' : `Error: ${JSON.stringify(analyticsRes.data)}`,
      analyticsRes.status === 200 || analyticsRes.status === 201
    )) { await finish(browser); return; }

    // TEST 38: Verify analytics API returns data
    const activityRes = await apiCall(page, 'GET', `/api/manager/properties/${SLUG}/activity`);
    if (!record(
      "Verify activity endpoint returns data",
      `GET /api/manager/properties/${SLUG}/activity`,
      `${activityRes.status}`,
      activityRes.status === 200 ? `Data returned` : `Error: ${JSON.stringify(activityRes.data)}`,
      activityRes.status === 200
    )) { await finish(browser); return; }

    // =========================================================================
    // PHASE 10 — REGRESSION
    // =========================================================================
    console.log("\n--- PHASE 10: REGRESSION ---\n");

    // TEST 39: Status engine parity
    const statusRes = await apiCall(page, 'GET', '/api/manager/current-property');
    const st = statusRes.data?.status;
    if (!record(
      "Status engine: consistent completionPercentage",
      "GET /api/manager/current-property",
      `${statusRes.status}`,
      `completion=${st?.completionPercentage}%, completed=${st?.completedCount}/${st?.totalCount}, ready=${st?.isReady}`,
      statusRes.status === 200 && typeof st?.completionPercentage === 'number'
    )) { await finish(browser); return; }

    // TEST 40: Currency parity
    const guestRes = await apiCall(page, 'GET', `/api/properties/${SLUG}`);
    const mgrCurrency = statusRes.data?.property?.currency;
    const guestCurrency = guestRes.data?.property?.currency;
    if (!record(
      "Currency parity (Manager ↔ Guest)",
      "Compare APIs",
      `mgr=${mgrCurrency}, guest=${guestCurrency}`,
      mgrCurrency === guestCurrency ? `Match: ${mgrCurrency}` : `MISMATCH`,
      mgrCurrency === guestCurrency
    )) { await finish(browser); return; }

    // TEST 41: Check-in/out persist
    const timesRes = await apiCall(page, 'GET', `/api/manager/properties/${SLUG}?includeRelations=true`);
    if (!record(
      "Check-in/out times persist",
      `GET /api/manager/properties/${SLUG}`,
      `${timesRes.status}`,
      `checkIn=${timesRes.data?.checkInTime}, checkOut=${timesRes.data?.checkOutTime}`,
      timesRes.status === 200 && timesRes.data?.checkInTime === "15:00" && timesRes.data?.checkOutTime === "11:00"
    )) { await finish(browser); return; }

    // TEST 42: Sensitive content rejected
    const sensitiveRes = await apiCall(page, 'PUT', `/api/manager/properties/${SLUG}/amenities`, {
      amenities: [{ name: "WiFi password=abc123", icon: "📶", status: "ACTIVE" }]
    });
    if (!record(
      "Sensitive content rejected with HTTP 422",
      `PUT …/amenities`,
      `${sensitiveRes.status}`,
      sensitiveRes.status === 422 ? `Rejected: ${sensitiveRes.data?.reason}` : `NOT REJECTED: ${sensitiveRes.status}`,
      sensitiveRes.status === 422
    )) { await finish(browser); return; }

    // TEST 43: Publish state
    const finalStatus = await apiCall(page, 'GET', '/api/manager/current-property');
    if (!record(
      "Publish state in status engine",
      "GET /api/manager/current-property",
      `${finalStatus.status}`,
      `publishState=${finalStatus.data?.status?.publishState}, isPublished=${finalStatus.data?.property?.isPublished}`,
      finalStatus.status === 200 && finalStatus.data?.property?.isPublished === true
    )) { await finish(browser); return; }

    // TEST 44: Snapshot history
    const snapshotRes = await apiCall(page, 'GET', `/api/manager/properties/${SLUG}/snapshots`);
    const snapCount = Array.isArray(snapshotRes.data) ? snapshotRes.data.length : snapshotRes.data?.snapshots?.length || 0;
    if (!record(
      "Snapshot history exists",
      `GET /api/manager/properties/${SLUG}/snapshots`,
      `${snapshotRes.status}`,
      `${snapCount} snapshots found`,
      snapshotRes.status === 200 && snapCount > 0
    )) { await finish(browser); return; }

  } catch (err) {
    console.error("\nUNEXPECTED ERROR:", err.message);
    record("Unexpected error", "N/A", "N/A", err.message, false);
  }

  await finish(browser);
}

async function finish(browser) {
  await browser.close();

  console.log("\n================================================================================");
  console.log("P0 QA CONTINUATION RESULTS");
  console.log("================================================================================\n");

  console.log("| Test | Action | Request | Response | Browser Result | Result |");
  console.log("|------|--------|---------|----------|----------------|--------|");
  for (const r of results) {
    console.log(`| ${r.test} | ${r.action} | ${r.request} | ${r.responseCode} | ${r.browserResult} | ${r.result} |`);
  }

  const failures = results.filter(r => r.result === 'FAIL');
  if (failures.length > 0) {
    console.log("\n================================================================================");
    console.log("FAILED TESTS");
    console.log("================================================================================");
    for (const f of failures) {
      console.log(`\nTEST ${f.test}: ${f.action}`);
      console.log(`  Evidence: ${f.responseCode} | ${f.browserResult}`);
    }
  } else {
    console.log(`\n✔ ALL ${results.length} CONTINUATION TESTS PASSED`);
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);
}

run();
