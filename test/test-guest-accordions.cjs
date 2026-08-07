const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Set Android Mobile Viewport
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await page.goto('https://scanvista.vercel.app/g/cms6kzqv700045d8u07bzen1p', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  console.log("=== Testing Android Mobile Viewport (412x915) ===");

  // 1. Test Floating Button (no accordion needed)
  const fabCheck = await page.evaluate(() => {
    const fab = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Call Reception'));
    if (!fab) return { error: 'FAB not found' };
    const rect = fab.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      text: fab.innerText.trim(),
      href: fab.href,
      clickable: fab === el || fab.contains(el),
      hitElement: el?.tagName
    };
  });
  console.log("1. Floating Action Button:", fabCheck);

  // 2. Expand "Stay Information" Accordion
  console.log("\n2. Expanding 'Stay Information' Accordion...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Stay Information'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000)); // wait for CSS transition

  const stayInfoCheck = await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a[href^="tel:"]')).find(a => a.href.includes('555-0100') && !a.innerText.includes('Call Reception') && !a.innerText.includes('RECEPTION'));
    if (!link) return { error: 'Stay info phone link not found' };
    link.scrollIntoView({ block: 'center' });
    const rect = link.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      text: link.innerText.trim(),
      href: link.href,
      clickable: link === el || link.contains(el),
      hitElement: el?.tagName
    };
  });
  console.log("Stay Info Phone Link:", stayInfoCheck);

  // 3. Expand "Guest Assistance" Accordion
  console.log("\n3. Expanding 'Guest Assistance' Accordion...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Guest Assistance'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000)); // wait for CSS transition

  const assistanceChecks = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'))
      .filter(a => !a.innerText.includes('Call Reception') && a.closest('.border-b')?.innerText?.includes('Guest Assistance'));
    
    const results = [];
    for (const link of links) {
      link.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 100));
      const rect = link.getBoundingClientRect();
      const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      results.push({
        text: link.innerText.replace(/\n+/g, ' ').trim(),
        href: link.href,
        clickable: link === el || link.contains(el),
        hitElement: el?.tagName + (el?.className ? '.' + el.className.split(' ')[0] : '')
      });
    }
    return results;
  });
  console.log("Guest Assistance Cards in Expanded State:", JSON.stringify(assistanceChecks, null, 2));

  // 4. Repeat for iPhone Viewport (390 x 844)
  console.log("\n=== Testing iPhone Viewport (390x844) ===");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Expand Guest Assistance on iPhone
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Guest Assistance'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const iphoneAssistanceChecks = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'))
      .filter(a => !a.innerText.includes('Call Reception') && a.closest('.border-b')?.innerText?.includes('Guest Assistance'));
    
    const results = [];
    for (const link of links) {
      link.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 100));
      const rect = link.getBoundingClientRect();
      const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      results.push({
        text: link.innerText.replace(/\n+/g, ' ').trim(),
        href: link.href,
        clickable: link === el || link.contains(el),
        hitElement: el?.tagName
      });
    }
    return results;
  });
  console.log("iPhone Guest Assistance Cards:", JSON.stringify(iphoneAssistanceChecks, null, 2));

  await browser.close();
})();
