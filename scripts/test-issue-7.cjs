const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(URL, (res) => resolve(res)).on('error', reject);
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error("Server failed to start");
}

async function run() {
  console.log("Starting production build server locally...");
  const server = spawn('node', ['dist/server.cjs'], {
    env: { ...process.env, PORT: PORT.toString() }
  });

  server.stdout.on('data', d => process.stdout.write('[server] ' + d));
  server.stderr.on('data', d => process.stderr.write('[server] ' + d));

  try {
    await waitForServer();
    console.log("Server is up. Launching browser...");

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Setup: We need to make sure we are 'logged out' first
    // Simulate a previous session logout
    await page.goto(`${URL}/manager`);
    await page.evaluate(() => sessionStorage.setItem("loggedOut", "true"));
    
    const loggedOutFlag1 = await page.evaluate(() => sessionStorage.getItem("loggedOut"));
    console.log(`TEST A - Start: loggedOut flag is: ${loggedOutFlag1}`);
    
    if (loggedOutFlag1 !== "true") throw new Error("Failed to set loggedOut flag");

    // Simulate Google Login Callback pointing to onboarding
    console.log("TEST A: Authenticating new user (via verify-session)...");
    const testEmail = `test.owner.${Date.now()}@example.com`;
    
    // Must create user first!
    await prisma.user.create({
      data: {
        email: testEmail,
        name: "Puppeteer Test User",
        googleId: `google-${Date.now()}`
      }
    });

    await page.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${testEmail}&returnTo=/manager/onboarding`);
    
    // Wait for Onboarding to load
    await page.waitForSelector('input[placeholder*="e.g. Sunset Bay"]');
    console.log("TEST A: Onboarding opened successfully.");

    const loggedOutFlag2 = await page.evaluate(() => sessionStorage.getItem("loggedOut"));
    console.log(`TEST A: loggedOut flag is now: ${loggedOutFlag2}`);
    if (loggedOutFlag2 !== null) throw new Error("Flag was NOT cleared on Onboarding mount!");
    console.log("TEST A PASSED: loggedOut flag was cleared properly.\n");

    // TEST B: Complete Quick Setup
    console.log("TEST B: Completing Quick Setup...");
    await page.type('input[placeholder*="e.g. Sunset Bay"]', "Test Regression Hotel");
    await page.click('button[type="submit"]');
    
    // Wait for step 2 "Go to Dashboard"
    await page.waitForXPath('//button[contains(., "Go to Dashboard")]');
    console.log("TEST B: Quick setup finished. Clicking Go to Dashboard...");
    
    const [dashBtn] = await page.$x('//button[contains(., "Go to Dashboard")]');
    await dashBtn.click();
    
    // Wait for Manager Home
    await page.waitForXPath('//h1[contains(., "Overview")]', { timeout: 5000 });
    console.log("TEST B: Manager Home opened. No redirect loop!");
    const currentUrl = page.url();
    if (!currentUrl.includes('/manager/home')) throw new Error(`Wrong URL: ${currentUrl}`);
    console.log("TEST B PASSED.\n");

    // TEST C: Refresh Manager Home
    console.log("TEST C: Refreshing Manager Home...");
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForXPath('//h1[contains(., "Overview")]');
    console.log("TEST C PASSED: Still authenticated after refresh.\n");

    // TEST D: Logout
    console.log("TEST D: Logging out...");
    const [signOutBtn] = await page.$x('//button[contains(., "Sign Out")]');
    if (signOutBtn) await signOutBtn.click();
    else await page.evaluate(() => fetch("/api/logout", { method: "POST" }).then(() => window.location.href = "/manager"));
    
    // Wait for redirect to /manager
    await page.waitForFunction(() => window.location.pathname === '/manager' || window.location.pathname === '/');
    
    const loggedOutFlag3 = await page.evaluate(() => sessionStorage.getItem("loggedOut"));
    console.log(`TEST D: loggedOut flag is: ${loggedOutFlag3}`);
    
    // Check protected API
    const apiRes = await page.evaluate(async () => {
      const res = await fetch('/api/me');
      return res.status;
    });
    console.log(`TEST D: /api/me returned ${apiRes}`);
    if (apiRes !== 401) throw new Error("API should return 401 after logout!");
    console.log("TEST D PASSED.\n");

    // TEST E: Back after logout
    console.log("TEST E: Attempting to go back to Dashboard after logout...");
    await page.goto(`${URL}/manager/home`);
    
    // Should be redirected to /manager
    await page.waitForFunction(() => window.location.pathname === '/manager');
    console.log("TEST E PASSED: Successfully redirected away from protected route.\n");

    // TEST F: Existing account login
    console.log("TEST F: Logging in with existing account...");
    await page.goto(`${URL}/api/auth/verify-session?token=fishstaurant-prod-auth-2026&email=${testEmail}&returnTo=/manager/home`);
    await page.waitForXPath('//h1[contains(., "Overview")]');
    console.log("TEST F PASSED: Existing user reached dashboard normally.\n");

    console.log("ALL FOCUSED REGRESSION TESTS PASSED!");
    await browser.close();

  } catch (e) {
    console.error("\nTEST FAILED:", e);
    process.exitCode = 1;
  } finally {
    console.log("Shutting down server...");
    server.kill();
    process.exit();
  }
}

run();
