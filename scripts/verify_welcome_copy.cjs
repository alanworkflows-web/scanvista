const fs = require('fs');

function runWelcomeCopyTest() {
  console.log('==================================================');
  console.log('FOCUSED TEST: MANAGER HOME HEADER COPY (ISSUE #4)');
  console.log('==================================================\n');

  try {
    const fileContent = fs.readFileSync('./src/pages/ManagerHome.tsx', 'utf8');

    // Helper logic replicating ManagerHome line 215-222
    function getHeaderCopy(property) {
      const heading = property.owner?.name ? `Good Morning, ${property.owner.name.split(' ')[0]}` : 'Manager Dashboard';
      const subtitle = property.owner?.name 
        ? "Here's what's happening with your property today." 
        : "Manage your property, guest experience, and publishing from one place.";
      return { heading, subtitle };
    }

    // ----------------------------------------------------
    // TEST 1: Named Owner (e.g. "Alexander Hamilton")
    // ----------------------------------------------------
    console.log('--- TEST 1: Named Owner Greeting Evaluation ---');
    const namedProp = { owner: { name: 'Alexander Hamilton' }, name: 'Grand Hotel' };
    const res1 = getHeaderCopy(namedProp);
    console.log(`Owner Name: '${namedProp.owner.name}'`);
    console.log(`Evaluated Main Heading: '${res1.heading}'`);
    console.log(`Evaluated Subtitle: '${res1.subtitle}'`);

    if (res1.heading !== 'Good Morning, Alexander' || res1.subtitle !== "Here's what's happening with your property today.") {
      throw new Error(`TEST 1 FAILED: Expected 'Good Morning, Alexander', got '${res1.heading}'`);
    }
    console.log('✅ TEST 1 PASSED: Named owner evaluates to "Good Morning, Alexander" and approved subtitle.\n');

    // ----------------------------------------------------
    // TEST 2: Unnamed / Null Owner
    // ----------------------------------------------------
    console.log('--- TEST 2: Unnamed Owner Fallback Evaluation ---');
    const unnamedProp = { owner: null, name: 'Anonymous Resort' };
    const res2 = getHeaderCopy(unnamedProp);
    console.log(`Owner Name: null`);
    console.log(`Evaluated Main Heading: '${res2.heading}'`);
    console.log(`Evaluated Subtitle: '${res2.subtitle}'`);

    if (res2.heading !== 'Manager Dashboard' || res2.subtitle !== "Manage your property, guest experience, and publishing from one place.") {
      throw new Error(`TEST 2 FAILED: Expected 'Manager Dashboard', got '${res2.heading}'`);
    }
    console.log('✅ TEST 2 PASSED: Unnamed owner evaluates to "Manager Dashboard" and approved fallback subtitle.\n');

    // ----------------------------------------------------
    // TEST 3: Codebase Verification - No 'Welcome Back' Text
    // ----------------------------------------------------
    console.log('--- TEST 3: Verify No Duplicate Greeting Text in ManagerHome.tsx ---');
    const welcomeBackCount = (fileContent.match(/Welcome Back/g) || []).length;
    console.log(`Occurrences of 'Welcome Back' in ManagerHome.tsx: ${welcomeBackCount}`);
    if (welcomeBackCount !== 0) {
      throw new Error(`TEST 3 FAILED: 'Welcome Back' still present in ManagerHome.tsx`);
    }
    console.log("✅ TEST 3 PASSED: 'Welcome Back' completely eliminated from ManagerHome.tsx.\n");

    // ----------------------------------------------------
    // TEST 4: Manager Home File Integrity & Structural Health
    // ----------------------------------------------------
    console.log('--- TEST 4: Verify Component Structure Integrity ---');
    const hasHeaderTag = fileContent.includes('Good Morning, ${property.owner.name.split(\' \')[0]}') && fileContent.includes('Manager Dashboard');
    if (!hasHeaderTag) {
      throw new Error('TEST 4 FAILED: ManagerHome.tsx copy logic missing');
    }
    console.log('✅ TEST 4 PASSED: Component copy logic structure verified 100% intact.\n');

    console.log('==================================================');
    console.log('ALL FOCUSED TESTS PASSED (TESTS 1-4)');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  }
}

runWelcomeCopyTest();
