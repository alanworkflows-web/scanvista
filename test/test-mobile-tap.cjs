const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await page.goto('https://scanvista.vercel.app/g/cms6kzqv700045d8u07bzen1p', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const results = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'));
    const checks = [];
    for (const link of links) {
      link.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise(r => setTimeout(r, 100));
      const rect = link.getBoundingClientRect();
      const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const isTarget = link === el || link.contains(el);
      checks.push({
        href: link.href,
        text: link.innerText.trim(),
        rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
        clickableWhenScrolled: isTarget,
        hitElement: el ? el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '') : 'none'
      });
    }
    return checks;
  });
  console.log('SCROLLED_TAP_CHECKS_ANDROID:', JSON.stringify(results, null, 2));

  // Also test iPhone (390 x 844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const iphoneResults = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'));
    const checks = [];
    for (const link of links) {
      link.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise(r => setTimeout(r, 100));
      const rect = link.getBoundingClientRect();
      const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const isTarget = link === el || link.contains(el);
      checks.push({
        href: link.href,
        text: link.innerText.trim(),
        clickableWhenScrolled: isTarget,
        hitElement: el ? el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '') : 'none'
      });
    }
    return checks;
  });
  console.log('SCROLLED_TAP_CHECKS_IPHONE:', JSON.stringify(iphoneResults, null, 2));

  await browser.close();
})();
