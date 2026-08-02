export interface DiffResult {
  hasChanges: boolean;
  messages: string[];
  counts?: {
    property: number;
    dishes: number;
    amenities: number;
    rules: number;
    total: number;
  };
}

export function calculateChanges(draft: any, snapshot: any): DiffResult {
  if (!snapshot) {
    const draftDishCount = draft?.categories?.reduce((acc: number, c: any) => acc + (c.dishes?.length || 0), 0) || 0;
    const draftAmenityCount = draft?.amenities?.length || 0;
    return { 
      hasChanges: true, 
      messages: ['First time publishing this property.'],
      counts: {
        property: 1,
        dishes: draftDishCount,
        amenities: draftAmenityCount,
        rules: 1,
        total: 1 + draftDishCount + draftAmenityCount + 1
      }
    };
  }

  const messages: string[] = [];
  let propertyChanges = 0;
  let dishChanges = 0;
  let amenityChanges = 0;
  let ruleChanges = 0;

  // Basic Info
  const draftProp = draft.property || draft;
  const snapProp = snapshot.property || snapshot;

  if (draftProp.name !== snapProp.name) {
    messages.push('Property Name updated');
    propertyChanges++;
  }
  if (draftProp.heroImage !== snapProp.heroImage || draftProp.bannerUrl !== snapProp.bannerUrl) {
    messages.push('Hero image / banner updated');
    propertyChanges++;
  }
  if (draftProp.checkInTime !== snapProp.checkInTime || draftProp.checkOutTime !== snapProp.checkOutTime) {
    messages.push('Check-in/Check-out timings updated');
    ruleChanges++;
  }

  // Categories & Menus
  const draftCats = draft.categories || draftProp.categories || [];
  const snapCats = snapshot.categories || snapProp.categories || [];
  const draftDishes = draftCats.flatMap((c: any) => c.dishes || []);
  const snapDishes = snapCats.flatMap((c: any) => c.dishes || []);

  if (draftCats.length !== snapCats.length) {
    messages.push(`Menu Categories changed (${draftCats.length} total)`);
    dishChanges += Math.abs(draftCats.length - snapCats.length);
  }
  if (draftDishes.length !== snapDishes.length) {
    messages.push(`Menu Items updated (${draftDishes.length} total)`);
    dishChanges += Math.abs(draftDishes.length - snapDishes.length);
  }

  // Amenities
  const draftAmenities = draft.amenities || draftProp.amenities || [];
  const snapAmenities = snapshot.amenities || snapProp.amenities || [];
  if (draftAmenities.length !== snapAmenities.length) {
    const diff = Math.abs(draftAmenities.length - snapAmenities.length);
    messages.push(`Amenities changed (${draftAmenities.length} total)`);
    amenityChanges += diff;
  }

  // House Rules
  const draftRules = draftProp.hotelRules || draftProp.houseRules;
  const snapRules = snapProp.hotelRules || snapProp.houseRules;
  if (JSON.stringify(draftRules) !== JSON.stringify(snapRules)) {
    messages.push('House rules updated');
    ruleChanges++;
  }

  const total = propertyChanges + dishChanges + amenityChanges + ruleChanges;
  const hasChanges = messages.length > 0;

  return {
    hasChanges,
    messages: hasChanges ? messages : ['No structural changes detected since last publish.'],
    counts: {
      property: propertyChanges,
      dishes: dishChanges,
      amenities: amenityChanges,
      rules: ruleChanges,
      total
    }
  };
}
