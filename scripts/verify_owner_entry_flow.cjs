require('dotenv').config();
const puppeteer = require('puppeteer');
const http = require('http');
const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

async function verifyServerIsUp() {
  return new Promise((resolve) => {
    const req = http.get(URL, (res) => resolve(true));
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function run() {
  console.log("Checking if local server is running...");
  let isUp = await verifyServerIsUp();
  let serverProcess = null;
  if (!isUp) {
    console.log("Starting production build server locally...");
    serverProcess = spawn('node', ['dist/server.cjs'], {
      env: { ...process.env, NODE_ENV: 'production', SESSION_SECRET: 'test-secret-123', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret', GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback' },
      stdio: 'inherit'
    });
    // Wait for server to boot
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await verifyServerIsUp()) {
        isUp = true;
        break;
      }
    }
    if (!isUp) {
      console.error("Failed to start local server.");
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const testEmail = `owner.routing.${Date.now()}@example.com`;

  try {
    const page = await browser.newPage();

    // Create user in DB for testing
    await prisma.user.create({
      data: {
        email: testEmail,
        name: "Routing Test User",
        googleId: `google-route-${Date.now()}`
      }
    });

    console.log("TEST A: New owner, zero properties -> onboarding");
    // Even if they requested /manager/home, the server should intercept and send them to /manager/onboarding
    await page.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${testEmail}&returnTo=/manager/home`);
    await page.waitForFunction(() => window.location.pathname === '/manager/onboarding');
    console.log("TEST A PASSED: Deterministically routed to onboarding.\n");

    console.log("TEST B: New owner completes setup -> dashboard");
    const [input] = await page.$x('//input[contains(@placeholder, "e.g. Sunset Bay")]');
    await input.type("Test Setup Property");
    const [submitBtn] = await page.$x('//button[@type="submit"]');
    await submitBtn.click();
    
    await page.waitForXPath('//button[contains(., "Go to Dashboard")]', { timeout: 10000 });
    const [dashBtn] = await page.$x('//button[contains(., "Go to Dashboard")]');
    await dashBtn.click();
    await page.waitForXPath('//h1[contains(., "Overview")]', { timeout: 10000 });
    console.log("TEST B PASSED: Quick setup navigated directly to dashboard.\n");

    console.log("TEST C: Logout / login -> dashboard");
    // Logout
    await page.evaluate(() => fetch("/api/logout", { method: "POST" }).then(() => window.location.href = "/manager"));
    await page.waitForFunction(() => window.location.pathname === '/manager' || window.location.pathname === '/');
    
    // Login again, even without a returnTo, or if returnTo is undefined
    await page.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${testEmail}`);
    await page.waitForFunction(() => window.location.pathname.includes('/manager/home'));
    console.log("TEST C PASSED: Routed to dashboard after re-login.\n");

    console.log("TEST D: Existing owner new browser/session -> dashboard");
    const newContext = await browser.createIncognitoBrowserContext();
    const page2 = await newContext.newPage();
    await page2.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${testEmail}&returnTo=/manager`);
    await page2.waitForFunction(() => window.location.pathname.includes('/manager/home'));
    console.log("TEST D PASSED: Incognito session routed to dashboard natively.\n");

    console.log("TEST E: Refresh dashboard -> dashboard");
    await page2.reload({ waitUntil: 'networkidle0' });
    await page2.waitForFunction(() => window.location.pathname.includes('/manager/home'));
    console.log("TEST E PASSED: Refresh stays on dashboard.\n");

    console.log("TEST F: No property -> onboarding");
    const noPropEmail = `noprop.${Date.now()}@example.com`;
    await prisma.user.create({ data: { email: noPropEmail, name: "No Prop User" } });
    const page3 = await newContext.newPage();
    // Try to access /manager/publishing directly without properties
    await page3.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${noPropEmail}&returnTo=/manager/publishing`);
    await page3.waitForFunction(() => window.location.pathname.includes('/manager/onboarding'));
    console.log("TEST F PASSED: Forced to onboarding regardless of intended URL.\n");

    console.log("TEST G: Property exists -> never onboarding");
    // Try to explicitly access onboarding when properties exist (using the first testEmail)
    await page2.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${testEmail}&returnTo=/manager/onboarding`);
    await page2.waitForFunction(() => window.location.pathname.includes('/manager/home'));
    console.log("TEST G PASSED: Forced away from onboarding to home.\n");

    console.log("ALL TESTS PASSED! Deterministic routing is verified.");
    await newContext.close();

  } catch (e) {
    console.error("\nTEST FAILED:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill();
    process.exit();
  }
}

run();
