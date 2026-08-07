const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://scanvista.vercel.app/g/cms6kzqv700045d8u07bzen1p', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Guest Assistance'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const details = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]'))
      .filter(a => !a.innerText.includes('Call Reception') && a.closest('.border-b')?.innerText?.includes('Guest Assistance'));
    
    const results = [];
    for (const link of links) {
      link.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 300));
      const rect = link.getBoundingClientRect();
      const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      results.push({
        text: link.innerText.replace(/\n+/g, ' ').trim(),
        href: link.href,
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
        isClickable: link === el || link.contains(el),
        hitTagName: el?.tagName,
        hitClassName: el?.className,
        hitOuterHTML: el?.outerHTML?.slice(0, 150)
      });
    }
    return results;
  });
  console.log('IPHONE_DETAILS:', JSON.stringify(details, null, 2));
  await browser.close();
})();
