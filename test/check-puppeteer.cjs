try {
  const puppeteer = require('puppeteer');
  console.log("PUPPETEER_AVAILABLE");
} catch (e) {
  console.log("PUPPETEER_NOT_AVAILABLE:", e.message);
}
