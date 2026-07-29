const fs = require('fs');

let c = fs.readFileSync('src/lib/completionEngine.ts', 'utf8');

c = c.replace(/\/\/ 1\. Property Information[\s\S]*const score = totalWeight > 0 \? Math\.round\(\(earnedWeight \/ totalWeight\) \* 100\) : 0;/m, `// 1. Property Information (Name)
  const hasName = !!(prop?.name && prop.name.trim());
  addCheck('Property Information', 15, hasName, 'Valid hotel name', prop?.name ? \`"\${prop.name}"\` : 'Empty name', 'Hotel name is required');

  // 2. Hero Image
  const hasHero = !!((prop?.bannerUrl && prop.bannerUrl.trim()) || (prop?.heroImage && prop.heroImage.trim()));
  addCheck('Hero Image', 10, hasHero, 'Hero image URL set', hasHero ? 'Image URL configured' : 'No image configured', 'Upload a hero banner image for your property');

  // 3. Logo
  const hasLogo = !!(prop?.logoUrl && prop.logoUrl.trim());
  addCheck('Property Logo', 10, hasLogo, 'Logo URL set', hasLogo ? 'Logo URL configured' : 'No logo configured', 'Upload a logo for your property');

  // 4. Contact Details
  const hasContact = !!((prop?.receptionPhone && prop.receptionPhone.trim()) || (prop?.emergencyPhone && prop.emergencyPhone.trim()));
  addCheck('Contact Details', 10, hasContact, 'Reception or Emergency phone set', hasContact ? (prop?.receptionPhone || prop?.emergencyPhone) : 'No phone set', 'Add a reception or host contact phone number');

  // 5. Dining Categories
  const hasCategories = categories.length > 0;
  addCheck('Dining Categories', 15, hasCategories, 'At least 1 menu category', \`\${categories.length} category(ies) found\`, 'Create at least 1 category in Menu Studio');

  // 6. Menu Dishes
  const hasDishes = dishes.length > 0;
  addCheck('Menu Dishes', 15, hasDishes, 'At least 1 dish item', \`\${dishes.length} dish(es) found\`, 'Add at least 1 dish item in Menu Studio');

  // 7. Amenities
  const hasAmenities = amenities.length > 0;
  addCheck('Amenities Configured', 10, hasAmenities, 'At least 1 amenity', \`\${amenities.length} amenity(ies) found\`, 'Add at least 1 amenity under Property settings');

  // 8. House Rules
  const hasRules = !!((prop?.hotelRules && Object.keys(prop.hotelRules).length > 0) || (prop?.houseRules && prop.houseRules.trim()));
  addCheck('House Rules', 10, hasRules, 'House rules set', hasRules ? 'Rules configured' : 'No rules configured', 'Add house rules or guidelines for your property');

  // 9. QR Enabled (Preview Token)
  const hasToken = !!(prop?.previewToken && prop.previewToken.trim());
  addCheck('QR Engine Ready', 5, hasToken, 'Preview token generated', hasToken ? 'System ready' : 'System preparing', 'Property system is initializing');

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;`);

fs.writeFileSync('src/lib/completionEngine.ts', c);
console.log('Fixed completionEngine.ts');
