export interface CheckDetail {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  reason?: string;
}

export interface CompletionResult {
  score: number;
  missing: string[];
  checks: CheckDetail[];
}

export function calculateCompletion(input: any): CompletionResult {
  if (!input) {
    return {
      score: 0,
      missing: ['Property data missing'],
      checks: []
    };
  }

  // Handle both flat property objects and wrapped { property, amenities, categories, dishes } objects
  const prop = input.property || input;
  const amenities = Array.isArray(input.amenities) 
    ? input.amenities 
    : (Array.isArray(prop?.amenities) ? prop.amenities : []);
    
  const categories = Array.isArray(input.categories) 
    ? input.categories 
    : (Array.isArray(prop?.categories) ? prop.categories : []);
    
  const dishes = Array.isArray(input.dishes) 
    ? input.dishes 
    : categories.flatMap((c: any) => (Array.isArray(c?.dishes) ? c.dishes : []));

  let totalWeight = 0;
  let earnedWeight = 0;
  const missing: string[] = [];
  const checks: CheckDetail[] = [];

  const addCheck = (
    name: string, 
    weight: number, 
    isComplete: boolean, 
    expected: string, 
    actual: string, 
    failureReason: string
  ) => {
    totalWeight += weight;
    const detail: CheckDetail = {
      name,
      expected,
      actual,
      passed: isComplete,
      reason: isComplete ? undefined : failureReason
    };
    checks.push(detail);

    if (isComplete) {
      earnedWeight += weight;
    } else {
      missing.push(name);
    }

    // Diagnostic console logging for execution audit
    console.log(`[Readiness Check] ${name}: ${isComplete ? 'PASSED' : 'FAILED'} (Expected: ${expected} | Actual: ${actual})`);
  };

  // 1. Property Information (Name)
  const hasName = !!(prop?.name && prop.name.trim());
  addCheck(
    'Property Information',
    20,
    hasName,
    'Valid hotel name',
    prop?.name ? `"${prop.name}"` : 'Empty name',
    'Hotel name is required'
  );

  // 2. Hero Image
  const hasHero = !!((prop?.bannerUrl && prop.bannerUrl.trim()) || (prop?.heroImage && prop.heroImage.trim()));
  addCheck(
    'Hero Image',
    15,
    hasHero,
    'Hero image or banner image URL set',
    hasHero ? 'Image URL configured' : 'No image configured',
    'Upload a hero banner image for your property'
  );

  // 3. Contact Details
  const hasContact = !!((prop?.receptionPhone && prop.receptionPhone.trim()) || (prop?.emergencyPhone && prop.emergencyPhone.trim()));
  addCheck(
    'Contact Details',
    15,
    hasContact,
    'Reception or Emergency phone set',
    hasContact ? (prop?.receptionPhone || prop?.emergencyPhone) : 'No phone set',
    'Add a reception or host contact phone number'
  );

  // 4. Dining Categories
  const hasCategories = categories.length > 0;
  addCheck(
    'Dining Categories',
    15,
    hasCategories,
    'At least 1 menu category',
    `${categories.length} category(ies) found`,
    'Create at least 1 category in Menu Studio'
  );

  // 5. Menu Dishes
  const hasDishes = dishes.length > 0;
  addCheck(
    'Menu Dishes',
    15,
    hasDishes,
    'At least 1 dish item',
    `${dishes.length} dish(es) found`,
    'Add at least 1 dish item in Menu Studio'
  );

  // 6. Amenities
  const hasAmenities = amenities.length > 0;
  addCheck(
    'Amenities Configured',
    20,
    hasAmenities,
    'At least 1 amenity',
    `${amenities.length} amenity(ies) found`,
    'Add at least 1 amenity under Property settings'
  );

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return {
    score: Math.min(100, Math.max(0, score)),
    missing,
    checks
  };
}
