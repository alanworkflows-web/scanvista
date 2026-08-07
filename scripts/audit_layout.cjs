const puppeteer = require('puppeteer');

async function auditLayout() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  
  try {
    const page = await browser.newPage();
    
    // Desktop audit
    await page.setViewport({ width: 1366, height: 900 });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    
    const desktopAudit = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const navCta = document.querySelector('#hero-nav-cta');
      const heroCta = document.querySelector('#hero-primary-cta');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const heroCtaRect = heroCta ? heroCta.getBoundingClientRect() : null;
      const navCtaRect = navCta ? navCta.getBoundingClientRect() : null;
      
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName,
        text: h.innerText.substring(0, 40),
        fontSize: window.getComputedStyle(h).fontSize,
        lineHeight: window.getComputedStyle(h).lineHeight,
        marginBottom: window.getComputedStyle(h).marginBottom
      }));
      
      return {
        h1Rect,
        heroCtaRect,
        navCtaRect,
        headings,
        bodyOverflow: document.body.scrollWidth > window.innerWidth
      };
    });
    
    console.log('DESKTOP LAYOUT AUDIT:', JSON.stringify(desktopAudit, null, 2));

    // Mobile audit
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    
    const mobileAudit = await page.evaluate(() => {
      const heroCta = document.querySelector('#hero-primary-cta');
      const heroCtaRect = heroCta ? heroCta.getBoundingClientRect() : null;
      const navCta = document.querySelector('#hero-nav-cta');
      const navCtaRect = navCta ? navCta.getBoundingClientRect() : null;
      
      const sections = Array.from(document.querySelectorAll('section')).map(s => ({
        id: s.id || 'hero',
        width: s.getBoundingClientRect().width,
        height: s.getBoundingClientRect().height
      }));

      return {
        heroCtaRect,
        navCtaRect,
        sections,
        bodyOverflow: document.body.scrollWidth > window.innerWidth
      };
    });

    console.log('MOBILE LAYOUT AUDIT:', JSON.stringify(mobileAudit, null, 2));

  } finally {
    await browser.close();
  }
}

auditLayout();
