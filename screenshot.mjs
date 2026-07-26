import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a common desktop size
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to http://localhost:3000/legal/terms");
  await page.goto('http://localhost:3000/legal/terms', { waitUntil: 'networkidle0' });

  // Scroll to the bottom of the page
  console.log("Scrolling to bottom...");
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  // Wait a moment for any lazy-loaded elements or animations at the bottom
  await new Promise(r => setTimeout(r, 1000));

  console.log("Capturing screenshot...");
  const screenshotPath = 'C:/Users/alok anand magada/.gemini/antigravity/brain/979885b7-92c5-4830-bb4b-243783d91883/legal_terms_bottom.png';
  await page.screenshot({ path: screenshotPath });

  console.log("Screenshot saved to: " + screenshotPath);
  await browser.close();
})();
