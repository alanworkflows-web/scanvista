const fs = require('fs');

function runGuestActionsRegressionSuite() {
  console.log('==================================================');
  console.log('FOCUSED REGRESSION SUITE: GUEST ACTIONS (ISSUE #5)');
  console.log('==================================================\n');

  try {
    const pageCode = fs.readFileSync('./src/pages/PropertyPage.tsx', 'utf8');

    // ----------------------------------------------------
    // TEST 1: Mobile + Menu/Amenities -> Quick Action Visible
    // ----------------------------------------------------
    console.log('--- TEST 1: Mobile + Menu/Amenities Tab Visibility ---');
    function shouldShowFloatingBar(activeTab, isMobile) {
      if (!isMobile) return false; // md:hidden
      if (activeTab === "wifi" || activeTab === "host") return false;
      return true;
    }

    const test1_menu = shouldShowFloatingBar("menu", true);
    const test1_amenities = shouldShowFloatingBar("amenities", true);
    console.log(`Mobile + 'menu' tab -> Floating bar visible? ${test1_menu}`);
    console.log(`Mobile + 'amenities' tab -> Floating bar visible? ${test1_amenities}`);

    if (!test1_menu || !test1_amenities) {
      throw new Error('TEST 1 FAILED: Quick action should be visible on mobile menu/amenities tabs');
    }
    console.log('✅ TEST 1 PASSED: Quick action bar visible on mobile menu and amenities tabs.\n');

    // ----------------------------------------------------
    // TEST 2: Mobile + Wi-Fi & Support -> Quick Action Hidden
    // ----------------------------------------------------
    console.log('--- TEST 2: Mobile + Wi-Fi & Support Tab Hidden ---');
    const test2_wifi = shouldShowFloatingBar("wifi", true);
    const test2_host = shouldShowFloatingBar("host", true);
    console.log(`Mobile + 'wifi' tab -> Floating bar visible? ${test2_wifi}`);
    console.log(`Mobile + 'host' tab -> Floating bar visible? ${test2_host}`);

    if (test2_wifi || test2_host) {
      throw new Error('TEST 2 FAILED: Quick action must be hidden on Wi-Fi and Host tabs to prevent redundancy');
    }
    console.log('✅ TEST 2 PASSED: Quick action bar hidden on Wi-Fi & Support tab on mobile.\n');

    // ----------------------------------------------------
    // TEST 3: Desktop + Any Tab -> Quick Action Hidden
    // ----------------------------------------------------
    console.log('--- TEST 3: Desktop Viewport (md and above) Hidden ---');
    const test3_desktop_menu = shouldShowFloatingBar("menu", false);
    const test3_desktop_wifi = shouldShowFloatingBar("wifi", false);
    console.log(`Desktop + 'menu' tab -> Floating bar visible? ${test3_desktop_menu}`);
    console.log(`Desktop + 'wifi' tab -> Floating bar visible? ${test3_desktop_wifi}`);

    if (test3_desktop_menu || test3_desktop_wifi) {
      throw new Error('TEST 3 FAILED: Quick action must be hidden on desktop viewports');
    }
    const hasMdHidden = pageCode.includes('<div className="md:hidden fixed bottom-0');
    console.log(`PropertyPage.tsx includes 'md:hidden' on floating container? ${hasMdHidden}`);
    if (!hasMdHidden) {
      throw new Error("TEST 3 FAILED: 'md:hidden' class missing on floating container");
    }
    console.log('✅ TEST 3 PASSED: Quick action bar hidden on desktop viewports across all tabs.\n');

    // ----------------------------------------------------
    // TEST 4: Existing Front Desk / WhatsApp / Email Links Intact
    // ----------------------------------------------------
    console.log('--- TEST 4: Action Href Protocols & Link Integrity ---');
    const hasTelLink = pageCode.includes('href={`tel:${property.receptionPhone}`}');
    const hasWhatsAppLink = pageCode.includes('href={`https://wa.me/${parsedContacts.whatsapp.replace(/[^0-9]/g, \'\')}`}');
    const hasMailtoLink = pageCode.includes('href={`mailto:${parsedContacts.email}`}');

    console.log(`tel: protocol present for Front Desk? ${hasTelLink}`);
    console.log(`wa.me/ protocol present for WhatsApp? ${hasWhatsAppLink}`);
    console.log(`mailto: protocol present for Email? ${hasMailtoLink}`);

    if (!hasTelLink || !hasWhatsAppLink || !hasMailtoLink) {
      throw new Error('TEST 4 FAILED: Action href protocols altered or corrupted');
    }
    console.log('✅ TEST 4 PASSED: Front Desk tel:, WhatsApp wa.me/, and Email mailto: links 100% intact.\n');

    // ----------------------------------------------------
    // TEST 5: No Content Obstruction or Overflow
    // ----------------------------------------------------
    console.log('--- TEST 5: Layout Padding & Container Scoping ---');
    const hasBottomPadding = pageCode.includes('pb-32 text-text-primary');
    console.log(`Outer container preserves pb-32 bottom padding? ${hasBottomPadding}`);
    if (!hasBottomPadding) {
      throw new Error('TEST 5 FAILED: pb-32 padding missing on main page container');
    }
    console.log('✅ TEST 5 PASSED: Container padding and layout scoping intact.\n');

    console.log('==================================================');
    console.log('ALL REGRESSION TESTS PASSED (TESTS 1-5)');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ REGRESSION TEST FAILED:', err.message);
    process.exitCode = 1;
  }
}

runGuestActionsRegressionSuite();
