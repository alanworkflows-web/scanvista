import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';
let propertySlug = '';
let categoryId = '';
let dishId = '';

const report = [];
function record(testName, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${testName} ${details ? '- ' + details : ''}`);
  report.push({ testName, passed, details });
}

async function runRegression() {
  try {
    console.log("--- AUTHENTICATION ---");
    // Google Login (Dev Bypass)
    let res = await fetch(`${BASE_URL}/auth/google`, { redirect: 'manual' });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie && setCookie.includes('connect.sid')) {
      sessionCookie = setCookie.split(';')[0];
      record('Google Login', true);
    } else {
      record('Google Login', false, 'Missing session cookie');
      return;
    }

    // CSRF Protection Check
    record('CSRF protection (SameSite)', setCookie.includes('SameSite=Lax'));

    // Session persistence & API check
    res = await fetch(`${BASE_URL}/api/me`, { headers: { 'Cookie': sessionCookie } });
    if (res.ok) {
      const user = await res.json();
      record('Session persistence', user.email === 'demo@example.com');
    } else {
      record('Session persistence', false, `Status ${res.status}`);
    }

    console.log("\n--- PROPERTY ---");
    // Create
    const rand = Math.floor(Math.random() * 10000);
    res = await fetch(`${BASE_URL}/api/manager/properties`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Regression Hotel ${rand}` })
    });
    if (res.ok) {
      const prop = await res.json();
      propertySlug = prop.slug;
      record('Create Property', true, `Slug: ${propertySlug}`);
    } else {
      record('Create Property', false);
    }

    // Edit & Save
    res = await fetch(`${BASE_URL}/api/manager/properties/${propertySlug}`, {
      method: 'PUT',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Edited description' })
    });
    record('Edit & Save Property', res.ok);

    // Refresh Property (Read)
    res = await fetch(`${BASE_URL}/api/properties/${propertySlug}`);
    const propData = await res.json();
    record('Refresh Property (Public Read)', propData?.property?.description === 'Edited description');

    console.log("\n--- MENU ---");
    // Categories
    res = await fetch(`${BASE_URL}/api/manager/properties/${propertySlug}/categories`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Starters' })
    });
    if (res.ok) {
      const cat = await res.json();
      categoryId = cat.id;
      record('Categories (Create)', true);
    } else {
      record('Categories (Create)', false);
    }

    // Dishes
    res = await fetch(`${BASE_URL}/api/manager/properties/${propertySlug}/dishes`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, name: 'Spring Rolls', price: 10 })
    });
    if (res.ok) {
      const dish = await res.json();
      dishId = dish.id;
      record('Dishes (Create)', true);
    } else {
      record('Dishes (Create)', false);
    }

    console.log("\n--- BILLING & SECURITY ---");
    // Ownership checks
    const badCookie = 'connect.sid=s%3Ainvalid.signature;';
    const badRes = await fetch(`${BASE_URL}/api/manager/properties/${propertySlug}/categories`, {
      method: 'POST',
      headers: { 'Cookie': badCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked' })
    });
    record('Ownership checks (Invalid Auth)', badRes.status === 401 || badRes.status === 403);

    // Entitlement enforcement (Set inactive)
    await prisma.subscription.upsert({
      where: { propertyId: propData.property.id },
      update: { status: 'inactive' },
      create: { propertyId: propData.property.id, status: 'inactive' }
    });
    
    // Try to create dish on expired subscription
    const expRes = await fetch(`${BASE_URL}/api/manager/properties/${propertySlug}/dishes`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, name: 'Blocked Dish', price: 10 })
    });
    record('Expired subscription restrictions', expRes.status === 403);

    // Premium activation / Upgrade (Set active)
    await prisma.subscription.upsert({
      where: { propertyId: propData.property.id },
      update: { status: 'active', planId: 'premium_plan' },
      create: { propertyId: propData.property.id, status: 'active', planId: 'premium_plan' }
    });
    
    // Try to create dish after upgrade
    const upgRes = await fetch(`${BASE_URL}/api/manager/properties/${propertySlug}/dishes`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, name: 'Premium Dish', price: 25 })
    });
    record('Premium activation (Upgrade)', upgRes.ok);

    console.log("\n--- GUEST ---");
    // Public menu loads
    const publicRes = await fetch(`${BASE_URL}/api/properties/${propertySlug}`);
    if (publicRes.ok) {
      const pubData = await publicRes.json();
      record('Public menu loads', pubData.categories.length === 1 && pubData.dishes.length === 2);
    } else {
      record('Public menu loads', false);
    }

    console.log("\n--- CLEANUP ---");
    // Logout
    const logoutRes = await fetch(`${BASE_URL}/api/logout`, { 
      method: 'POST',
      headers: { 'Cookie': sessionCookie }
    });
    record('Logout', logoutRes.ok);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

runRegression();
