export interface DiffResult {
  hasChanges: boolean;
  messages: string[];
}

export function calculateChanges(draft: any, snapshot: any): DiffResult {
  if (!snapshot) {
    return { hasChanges: true, messages: ['First time publishing this property.'] };
  }

  const messages: string[] = [];
  
  // Basic Info
  if (draft.name !== snapshot.name) messages.push('Property Name updated');
  if (draft.heroImage !== snapshot.heroImage) messages.push('Hero Image updated');
  if (draft.checkInTime !== snapshot.checkInTime || draft.checkOutTime !== snapshot.checkOutTime) {
    messages.push('Check-in/Check-out timings updated');
  }

  // Categories & Menus
  const draftCatCount = draft.categories?.length || 0;
  const snapCatCount = snapshot.categories?.length || 0;
  if (draftCatCount !== snapCatCount) {
    messages.push(`Menu Categories changed (${draftCatCount} total)`);
  } else {
    // Quick check if dishes changed
    const draftDishCount = draft.categories?.reduce((acc: number, c: any) => acc + (c.dishes?.length || 0), 0) || 0;
    const snapDishCount = snapshot.categories?.reduce((acc: number, c: any) => acc + (c.dishes?.length || 0), 0) || 0;
    if (draftDishCount !== snapDishCount) {
       messages.push(`Menu Items updated (${draftDishCount} total)`);
    }
  }

  // Amenities
  const draftAmenityCount = draft.amenities?.length || 0;
  const snapAmenityCount = snapshot.amenities?.length || 0;
  if (draftAmenityCount !== snapAmenityCount) {
    messages.push(`Amenities changed (${draftAmenityCount} total)`);
  }

  // Activities
  const draftActivityCount = draft.activities?.length || 0;
  const snapActivityCount = snapshot.activities?.length || 0;
  if (draftActivityCount !== snapActivityCount) {
    messages.push(`Activities changed (${draftActivityCount} total)`);
  }

  // Emergency Mode
  const draftMaint = draft.maintenanceMode ? JSON.stringify(draft.maintenanceMode) : null;
  const snapMaint = snapshot.maintenanceMode ? JSON.stringify(snapshot.maintenanceMode) : null;
  if (draftMaint !== snapMaint) {
    if (draftMaint) messages.push('🚨 Maintenance Mode rules updated');
    else messages.push('✅ Maintenance Mode deactivated');
  }

  if (messages.length === 0) {
    return { hasChanges: false, messages: ['No structural changes detected since last publish.'] };
  }

  return {
    hasChanges: true,
    messages
  };
}
