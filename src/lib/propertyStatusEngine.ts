import { calculateChanges, DiffResult } from "./diffEngine";
import { isValidPhoneNumber } from "./validationFramework";

export type PublishState = 'DRAFT' | 'PUBLISHED_PENDING_CHANGES' | 'PUBLISHED_LIVE' | 'PUBLISHED';
export type DraftState = 'CLEAN' | 'DIRTY' | 'UNSAVED_LOCAL';

export interface StatusItem {
  id: 'brand' | 'contacts' | 'menu' | 'amenities' | 'rules';
  label: string;
  category: 'Branding' | 'Operations' | 'Content' | 'Policies';
  completed: boolean;
  details: string;
  href: string;
  why: string;
  severity: 'error' | 'warning';
  priority: number;
}

export interface PropertyStatusResult {
  completionPercentage: number;
  percentage: number; // Compatibility alias
  completedCount: number;
  totalCount: number;
  isReady: boolean;
  isReadyToGoLive: boolean; // Alias
  propertyReadiness: {
    isBrandReady: boolean;
    isMenuReady: boolean;
    isAmenitiesReady: boolean;
    isContactsReady: boolean;
    isRulesReady: boolean;
  };
  items: StatusItem[];
  blockingIssues: StatusItem[];
  publishState: PublishState;
  draftState: DraftState;
  badgeLabel: string;
  badgeSubtext: string;
  badgeColor: string;
  badgeBg: string;
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  lastPublishedAt: string | null;
  lastDraftSavedAt: string | null;
  todayFocus: StatusItem[];
  diffResult: DiffResult | null;
  changeCounts: {
    propertyFields: number;
    dishes: number;
    amenities: number;
    rules: number;
    total: number;
  };
}

function safeParseJson(val: any): any {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return { text: val };
    }
  }
  return {};
}

/**
 * Single definitive source of truth for property status, launch readiness, and checklist.
 */
export function calculatePropertyStatus(input: any): PropertyStatusResult {
  const isInputWrapped = Boolean(input && typeof input === 'object' && 'property' in input && input.property !== undefined);
  const prop = isInputWrapped ? (input.property || null) : (input || null);
  const snapshots = Array.isArray(input?.snapshots) 
    ? input.snapshots 
    : (Array.isArray(prop?.snapshots) ? prop.snapshots : []);
  const draftData = isInputWrapped ? input.draftData : undefined;
  const localDraftData = isInputWrapped ? input.localDraftData : undefined;

  const defaultEmptyItems: StatusItem[] = [
    {
      id: 'brand',
      label: 'Property Branding & Cover',
      category: 'Branding',
      completed: false,
      details: 'Provide property name, logo, and cover image',
      href: '/manager/property',
      why: 'Property name, brand logo, and cover image are required for the guest welcome screen.',
      severity: 'error',
      priority: 1
    },
    {
      id: 'contacts',
      label: 'Guest & Reception Contacts',
      category: 'Operations',
      completed: false,
      details: 'Add a valid front desk or emergency contact number',
      href: '/manager/property',
      why: 'Guests need front desk or emergency phone numbers for direct support.',
      severity: 'error',
      priority: 2
    },
    {
      id: 'menu',
      label: 'Dining & Beverage Menu',
      category: 'Content',
      completed: false,
      details: 'Add food & drink categories and active dishes',
      href: '/manager/menu',
      why: 'Guests need to browse dining options and menu pricing.',
      severity: 'error',
      priority: 3
    },
    {
      id: 'amenities',
      label: 'Hotel Amenities & Facilities',
      category: 'Content',
      completed: false,
      details: 'Highlight Wi-Fi, pool, gym, or front desk amenities',
      href: '/manager/amenities',
      why: 'Showcase property facilities and operational hours to arriving guests.',
      severity: 'error',
      priority: 4
    },
    {
      id: 'rules',
      label: 'House Rules & Timings',
      category: 'Policies',
      completed: false,
      details: 'Configure check-in/out timings and house guidelines',
      href: '/manager/house-rules',
      why: 'Inform guests of check-in/out hours and stay policies.',
      severity: 'error',
      priority: 5
    }
  ];

  if (!prop) {
    return {
      completionPercentage: 0,
      percentage: 0,
      completedCount: 0,
      totalCount: 5,
      isReady: false,
      isReadyToGoLive: false,
      propertyReadiness: {
        isBrandReady: false,
        isMenuReady: false,
        isAmenitiesReady: false,
        isContactsReady: false,
        isRulesReady: false
      },
      items: defaultEmptyItems,
      blockingIssues: defaultEmptyItems,
      publishState: 'DRAFT',
      draftState: 'CLEAN',
      badgeLabel: 'Not Initialized',
      badgeSubtext: 'No property data found.',
      badgeColor: 'text-zinc-600 border-zinc-200 bg-zinc-50',
      badgeBg: 'bg-zinc-400',
      isPublished: false,
      hasUnpublishedChanges: false,
      lastPublishedAt: null,
      lastDraftSavedAt: null,
      todayFocus: defaultEmptyItems,
      diffResult: null,
      changeCounts: { propertyFields: 0, dishes: 0, amenities: 0, rules: 0, total: 0 }
    };
  }

  const amenities = Array.isArray(prop.amenities) 
    ? prop.amenities 
    : (Array.isArray(input?.amenities) ? input.amenities : []);
  const categories = Array.isArray(prop.categories) 
    ? prop.categories 
    : (Array.isArray(input?.categories) ? input.categories : []);
  const dishes = categories.flatMap((c: any) => (Array.isArray(c?.dishes) ? c.dishes : []));
  const contacts = safeParseJson(prop.contacts);
  const rules = safeParseJson(prop.hotelRules || prop.houseRules);

  // 1. Brand milestone
  const hasName = Boolean(prop.name && prop.name.trim().length >= 2);
  const hasLogo = Boolean(prop.logoUrl && prop.logoUrl.trim());
  const hasCover = Boolean((prop.bannerUrl && prop.bannerUrl.trim()) || (prop.heroImage && prop.heroImage.trim()));
  const isBrandReady = hasName && hasLogo && hasCover;

  // 2. Contacts milestone
  const hasContacts = Boolean(
    (prop.receptionPhone && isValidPhoneNumber(prop.receptionPhone)) ||
    (prop.emergencyPhone && isValidPhoneNumber(prop.emergencyPhone)) ||
    (contacts.phone && isValidPhoneNumber(contacts.phone)) ||
    (contacts.reception && isValidPhoneNumber(contacts.reception)) ||
    (contacts.whatsapp && isValidPhoneNumber(contacts.whatsapp))
  );

  // 3. Menu milestone
  const hasMenu = categories.length > 0 && dishes.length > 0;

  // 4. Amenities milestone
  const activeAmenities = amenities.filter((a: any) => a.status !== 'HIDDEN' && a.status !== 'INACTIVE');
  const hasAmenities = amenities.length > 0 || activeAmenities.length > 0;

  // 5. House rules milestone
  const hasRules = Boolean(
    (prop.checkInTime && prop.checkInTime.trim()) ||
    (prop.checkOutTime && prop.checkOutTime.trim()) ||
    (rules.quietHours && rules.quietHours.trim()) ||
    (rules.smokingPolicy && rules.smokingPolicy.trim()) ||
    (rules.petPolicy && rules.petPolicy.trim()) ||
    (rules.customRules && rules.customRules.trim()) ||
    (rules.text && rules.text.trim()) ||
    (typeof prop.hotelRules === 'string' && prop.hotelRules.trim()) ||
    (typeof prop.houseRules === 'string' && prop.houseRules.trim())
  );

  const items: StatusItem[] = [
    {
      id: 'brand',
      label: 'Property Branding & Cover',
      category: 'Branding',
      completed: isBrandReady,
      details: isBrandReady 
        ? 'Property name, brand logo, and hero cover configured' 
        : `Missing: ${[!hasName && 'Name', !hasLogo && 'Logo', !hasCover && 'Hero Banner'].filter(Boolean).join(', ')}`,
      href: '/manager/property',
      why: 'Property name, brand logo, and cover image are required for the guest welcome screen.',
      severity: 'error',
      priority: 1
    },
    {
      id: 'contacts',
      label: 'Guest & Reception Contacts',
      category: 'Operations',
      completed: hasContacts,
      details: hasContacts 
        ? 'Reception & emergency phone numbers active' 
        : 'Add a valid front desk or emergency contact number',
      href: '/manager/property',
      why: 'Guests need front desk or emergency phone numbers for direct support.',
      severity: 'error',
      priority: 2
    },
    {
      id: 'menu',
      label: 'Dining & Beverage Menu',
      category: 'Content',
      completed: hasMenu,
      details: hasMenu 
        ? `${dishes.length} dishes across ${categories.length} categories` 
        : 'Add food & drink categories and active dishes',
      href: '/manager/menu',
      why: 'Guests need to browse dining options and menu pricing.',
      severity: 'error',
      priority: 3
    },
    {
      id: 'amenities',
      label: 'Hotel Amenities & Facilities',
      category: 'Content',
      completed: hasAmenities,
      details: hasAmenities 
        ? `${amenities.length} hotel amenities configured` 
        : 'Highlight Wi-Fi, pool, gym, or front desk amenities',
      href: '/manager/amenities',
      why: 'Showcase property facilities and operational hours to arriving guests.',
      severity: 'error',
      priority: 4
    },
    {
      id: 'rules',
      label: 'House Rules & Timings',
      category: 'Policies',
      completed: hasRules,
      details: hasRules 
        ? 'Check-in/out hours & conduct policies defined' 
        : 'Configure check-in/out timings and house guidelines',
      href: '/manager/house-rules',
      why: 'Inform guests of check-in/out hours and stay policies.',
      severity: 'error',
      priority: 5
    }
  ];

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const isReady = completedCount === totalCount;
  const blockingIssues = items.filter(i => !i.completed);

  // Snapshot & Diff Evaluation
  const hasSnapshots = snapshots.length > 0 || Boolean(prop.isPublished);
  const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;
  const lastPublishedAt = latestSnapshot ? (latestSnapshot.publishedAt || latestSnapshot.createdAt) : null;
  const lastDraftSavedAt = prop.updatedAt || new Date().toISOString();

  let hasUnpublishedChanges = false;
  let diffResult: DiffResult | null = null;
  const changeCounts = {
    propertyFields: 0,
    dishes: 0,
    amenities: 0,
    rules: 0,
    total: 0
  };

  if (!hasSnapshots) {
    hasUnpublishedChanges = true;
  } else if (draftData && latestSnapshot?.data) {
    diffResult = calculateChanges(draftData, latestSnapshot.data);
    hasUnpublishedChanges = Boolean(diffResult && diffResult.hasChanges);
    if (diffResult && diffResult.counts) {
      changeCounts.propertyFields = diffResult.counts.property || 0;
      changeCounts.dishes = diffResult.counts.dishes || 0;
      changeCounts.amenities = diffResult.counts.amenities || 0;
      changeCounts.rules = diffResult.counts.rules || 0;
      changeCounts.total = diffResult.counts.total || 0;
    }
  }

  let publishState: PublishState = 'DRAFT';
  let badgeLabel = 'Draft';
  let badgeSubtext = 'Workspace in draft mode. Click Publish to make visible to guests.';
  let badgeColor = 'text-amber-800 border-amber-200 bg-amber-50';
  let badgeBg = 'bg-amber-500';

  if (hasSnapshots) {
    if (hasUnpublishedChanges) {
      publishState = 'PUBLISHED_PENDING_CHANGES';
      badgeLabel = 'Draft Changes Pending';
      badgeSubtext = 'Modifications made to property or menu. Publish to update live guests.';
      badgeColor = 'text-amber-800 border-amber-300 bg-amber-50';
      badgeBg = 'bg-amber-500';
    } else {
      publishState = 'PUBLISHED';
      badgeLabel = 'Published';
      badgeSubtext = 'All changes synced with live guest mobile view.';
      badgeColor = 'text-emerald-800 border-emerald-200 bg-emerald-50';
      badgeBg = 'bg-emerald-500';
    }
  }

  let draftState: DraftState = 'CLEAN';
  if (localDraftData) {
    draftState = 'UNSAVED_LOCAL';
  } else if (hasUnpublishedChanges) {
    draftState = 'DIRTY';
  }

  return {
    completionPercentage,
    percentage: completionPercentage,
    completedCount,
    totalCount,
    isReady,
    isReadyToGoLive: isReady,
    propertyReadiness: {
      isBrandReady,
      isMenuReady: hasMenu,
      isAmenitiesReady: hasAmenities,
      isContactsReady: hasContacts,
      isRulesReady: hasRules
    },
    items,
    blockingIssues,
    publishState,
    draftState,
    badgeLabel,
    badgeSubtext,
    badgeColor,
    badgeBg,
    isPublished: hasSnapshots,
    hasUnpublishedChanges,
    lastPublishedAt,
    lastDraftSavedAt,
    todayFocus: items,
    diffResult,
    changeCounts
  };
}

// Aliases for compatibility
export const calculateLaunchChecklist = (propOrInput: any, snapshots?: any[]) => {
  if (propOrInput && (propOrInput.property !== undefined || propOrInput.snapshots !== undefined)) {
    return calculatePropertyStatus({ ...propOrInput, snapshots: snapshots || propOrInput.snapshots });
  }
  return calculatePropertyStatus({ property: propOrInput, snapshots });
};
export const calculatePropertyReadiness = (prop: any) => {
  const res = calculatePropertyStatus(prop);
  return {
    isBrandReady: res.items.find(i => i.id === 'brand')?.completed || false,
    isMenuReady: res.items.find(i => i.id === 'menu')?.completed || false,
    isAmenitiesReady: res.items.find(i => i.id === 'amenities')?.completed || false,
    isContactsReady: res.items.find(i => i.id === 'contacts')?.completed || false,
    isRulesReady: res.items.find(i => i.id === 'rules')?.completed || false,
    blockingIssues: res.blockingIssues
  };
};

export type LaunchChecklistResult = PropertyStatusResult;
export type LaunchChecklistItem = StatusItem;
export type BlockingIssue = StatusItem;
