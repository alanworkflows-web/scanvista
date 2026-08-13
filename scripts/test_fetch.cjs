const puppeteer = require('puppeteer-core');

async function testFetchInBrowser() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--window-size=1280,800']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  try {
    console.log("1. Logging in...");
    await page.goto('http://localhost:3000/auth/dev/login?email=alanworkflows@gmail.com');
    
    console.log("2. Waiting for home page to load...");
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("3. Executing fetch script...");
    const result = await page.evaluate(async () => {
      try {
        console.log("Fetching /api/me...");
        const res1 = await fetch('/api/me');
        console.log("Status1:", res1.status);
        const data1 = await res1.json();
        console.log("ME data loaded");
        
        console.log("Fetching /api/manager/current-property...");
        const res2 = await fetch('/api/manager/current-property');
        console.log("Status2:", res2.status);
        const data2 = await res2.json();
        console.log("PROP data loaded");
        
        return { success: true, me: data1.email, prop: data2.property?.id };
      } catch (err) {
        return { success: false, error: err.toString() };
      }
    });
    
    console.log("EVALUATE RESULT:", result);
    process.exit(0);

  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testFetchInBrowser();
