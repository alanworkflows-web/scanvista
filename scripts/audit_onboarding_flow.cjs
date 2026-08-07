const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/alok anand magada/.gemini/antigravity/brain/44f6329e-f5a4-4d6c-b171-cd287adbbb97');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function runOnboardingAudit() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const auditLog = {};

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });

    // ----------------------------------------------------
    // SCREEN 1: Landing Page
    // ----------------------------------------------------
    console.log('[Audit] Screen 1: Landing Page');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    const screen1Img = path.join(ARTIFACT_DIR, 'audit_screen1_landing.png');
    await page.screenshot({ path: screen1Img, fullPage: true });
    
    auditLog.screen1 = await page.evaluate(() => {
      const ctas = Array.from(document.querySelectorAll('a, button')).map(el => ({
        text: el.innerText.trim(),
        href: el.getAttribute('href') || el.getAttribute('to') || '',
        id: el.id
      }));
      return {
        url: window.location.href,
        title: document.title,
        ctas: ctas.filter(c => c.text.length > 0)
      };
    });

    // ----------------------------------------------------
    // SCREEN 2 & 3: Click "Start Free for a Few Weeks" -> Sign In / Manager Landing
    // ----------------------------------------------------
    console.log('[Audit] Screen 2 & 3: Start Free / Sign In');
    await page.click('#hero-primary-cta');
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    
    const screen2Img = path.join(ARTIFACT_DIR, 'audit_screen2_manager_auth.png');
    await page.screenshot({ path: screen2Img, fullPage: true });

    auditLog.screen2_3 = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, p, span, button')).map(el => el.innerText.trim());
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        type: el.type,
        placeholder: el.placeholder,
        name: el.name
      }));
      return {
        url: window.location.href,
        headings: headings.filter(t => t.length > 0 && t.length < 80),
        inputs
      };
    });

    // ----------------------------------------------------
    // SCREEN 4: Create Property / Onboarding Flow
    // ----------------------------------------------------
    console.log('[Audit] Screen 4: Create Property / Onboarding');
    // Check if we can sign in or navigate to onboarding
    // Let's inspect the buttons on the Manager Auth page
    const authButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a')).map(b => ({
        text: b.innerText.trim(),
        href: b.getAttribute('href')
      }));
    });
    console.log('Auth page buttons:', authButtons);

    // Click Google Auth or Dev sign in if present
    const googleBtn = await page.$('button, a[href*="google"], a[href*="auth"]');
    if (googleBtn) {
      // Let's see what happens on click or check if test auth is available
    }

    // Let's check direct navigation to /manager/onboarding or simulate authenticated state
    // Let's first inspect how auth works in src/App.tsx and server.ts
  } catch (err) {
    console.error('Audit script error:', err);
  } finally {
    await browser.close();
  }
}

runOnboardingAudit();
