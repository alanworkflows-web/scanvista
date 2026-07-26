const puppeteer = require('puppeteer');

const routes = [
  { name: 'Landing Page', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Manager Restaurant', path: '/manager/restaurant' },
  { name: 'Founder HQ', path: '/founder' },
  { name: 'Guest QR Page (Placeholder)', path: '/qr/ocean-breeze-demo' } 
];

(async () => {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  let hasErrors = false;

  for (const route of routes) {
    console.log(`\n======================================`);
    console.log(`Testing Route: ${route.name} (${route.path})`);
    const page = await browser.newPage();
    
    // Intercept network requests to log exact failed URLs
    page.on('response', response => {
      if (!response.ok()) {
        console.error(`[NETWORK ERROR] ${response.status()} ${response.url()}`);
        // We will ignore 401 on /api/me as it is expected for unauthenticated sessions
        // We will ignore 404 on favicon.ico
        if (response.status() === 401 && response.url().includes('/api/me')) return;
        if (response.status() === 404 && response.url().includes('/favicon.ico')) return;
        
        hasErrors = true;
      }
    });

    page.on('pageerror', err => {
      console.error(`[PAGE ERROR] ${err.message}`);
      hasErrors = true;
    });

    try {
      const response = await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
      console.log(`Status: ${response.status()}`);
      
      const content = await page.content();
      if (content.includes('vite-error-overlay') || content.includes('Uncaught Error')) {
        console.error('[REACT COMPILE/RUNTIME ERROR] Vite error overlay detected in DOM.');
        hasErrors = true;
      } else {
        console.log(`Successfully loaded ${route.name}`);
      }
    } catch (e) {
      console.error(`[NAVIGATION FAILED] ${e.message}`);
      hasErrors = true;
    }
    
    await page.close();
  }

  await browser.close();
  
  if (hasErrors) {
    console.log(`\nVerification FAILED: Errors were detected.`);
    process.exit(1);
  } else {
    console.log(`\nVerification PASSED: All routes loaded successfully with no console errors.`);
    process.exit(0);
  }
})();
