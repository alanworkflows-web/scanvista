import { calculateChanges, DiffResult } from "./diffEngine";

export type PublishState = 'DRAFT' | 'PUBLISHED_PENDING_CHANGES' | 'PUBLISHED_LIVE' | 'PUBLISHED';
export type DraftState = 'CLEAN' | 'DIRTY' | 'UNSAVED_LOCAL';

export interface BlockingIssue {
  key: string;
  title: string;
  description: string;
  href: string;
  severity: 'error' | 'warning';
}

export interface TodayFocusItem {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  priority: number; // 1 highest
}

export interface PropertyReadiness {
  isBrandReady: boolean;
  isMenuReady: boolean;
  isAmenitiesReady: boolean;
  isContactsReady: boolean;
  isRulesReady: boolean;
  blockingIssues?: BlockingIssue[];
}

export interface PropertyStatusResult {
  completionPercentage: number;
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
  blockingIssues: BlockingIssue[];
  propertyReadiness: PropertyReadiness;
  todayFocus: TodayFocusItem[];
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

export function calculatePropertyReadiness(prop: any): PropertyReadiness & { blockingIssues: BlockingIssue[] } {
  if (!prop) {
    return {
      isBrandReady: false,
      isMenuReady: false,
      isAmenitiesReady: false,
      isContactsReady: false,
      isRulesReady: false,
      blockingIssues: [{
        key: 'no_property',
        title: 'Property Not Initialized',
        description: 'Please initialize your property.',
        href: '/manager/experience',
        severity: 'error'
      }]
    };
  }

  const amenities = Array.isArray(prop.amenities) ? prop.amenities : [];
  const categories = Array.isArray(prop.categories) ? prop.categories : [];
  const dishes = categories.flatMap((c: any) => (Array.isArray(c?.dishes) ? c.dishes : []));
  const contacts = safeParseJson(prop.contacts);
  const rules = safeParseJson(prop.hotelRules || prop.houseRules);

  const hasName = Boolean(prop.name && prop.name.trim());
  const hasTagline = Boolean(prop.tagline && prop.tagline.trim());
  const hasLogo = Boolean(prop.logoUrl && prop.logoUrl.trim());
  const hasBanner = Boolean((prop.bannerUrl && prop.bannerUrl.trim()) || (prop.heroImage && prop.heroImage.trim()));
  const isBrandReady = hasName && (hasLogo || hasBanner || hasTagline || prop.name.length >= 2);

  const isMenuReady = categories.length > 0 && dishes.length > 0;
  const isAmenitiesReady = amenities.length > 0;

  const hasReception = Boolean(prop.receptionPhone && prop.receptionPhone.trim());
  const hasAnyContact = Boolean(
    hasReception || 
    (prop.emergencyPhone && prop.emergencyPhone.trim()) || 
    (contacts.phone && contacts.phone.trim()) || 
    (contacts.whatsapp && contacts.whatsapp.trim()) || 
    (contacts.email && contacts.email.trim())
  );
  const isContactsReady = hasAnyContact;

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
  const isRulesReady = hasRules;

  const blockingIssues: BlockingIssue[] = [];
  if (!isBrandReady) {
    blockingIssues.push({
      key: 'missing_brand',
      title: 'Missing Property Name',
      description: 'Add your property name to personalize the guest experience.',
      href: '/manager/experience',
      severity: 'error'
    });
  }
  if (!isMenuReady) {
    blockingIssues.push({
      key: 'missing_menu',
      title: 'Incomplete Dining Menu',
      description: 'Add at least one menu category and dish item.',
      href: '/manager/menu',
      severity: 'warning'
    });
  }
  if (!isAmenitiesReady) {
    blockingIssues.push({
      key: 'missing_amenities',
      title: 'No Amenities Listed',
      description: 'Highlight Wi-Fi, pool, or gym amenities for your guests.',
      href: '/manager/amenities',
      severity: 'warning'
    });
  }
  if (!isContactsReady) {
    blockingIssues.push({
      key: 'missing_contacts',
      title: 'No Reception Contact',
      description: 'Add a front desk or emergency phone number for guest support.',
      href: '/manager/experience',
      severity: 'error'
    });
  }

  return {
    isBrandReady,
    isMenuReady,
    isAmenitiesReady,
    isContactsReady,
    isRulesReady,
    blockingIssues
  };
}

export function getPropertyStatus(input: {
  property: any;
  snapshots?: any[];
  draftData?: any;
  localDraftData?: any;
}): PropertyStatusResult {
  const prop = input.property || null;
  if (!prop) {
    return {
      completionPercentage: 0,
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
      blockingIssues: [{
        key: 'no_property',
        title: 'Property Not Initialized',
        description: 'Please create your property first.',
        href: '/manager/experience',
        severity: 'error'
      }],
      propertyReadiness: {
        isBrandReady: false,
        isMenuReady: false,
        isAmenitiesReady: false,
        isContactsReady: false,
        isRulesReady: false
      },
      todayFocus: [],
      diffResult: null,
      changeCounts: { propertyFields: 0, dishes: 0, amenities: 0, rules: 0, total: 0 }
    };
  }

  const readiness = calculatePropertyReadiness(prop);
  const categories = Array.isArray(prop.categories) ? prop.categories : [];
  const amenities = Array.isArray(prop.amenities) ? prop.amenities : [];

  // Completion score calculation
  let completionPercentage = 0;
  if (readiness.isBrandReady) completionPercentage += 20;
  if (readiness.isMenuReady) completionPercentage += 20;
  else if (categories.length > 0) completionPercentage += 10;
  if (readiness.isAmenitiesReady) completionPercentage += 20;
  if (readiness.isContactsReady) completionPercentage += 20;
  if (readiness.isRulesReady) completionPercentage += 20;

  // Snapshot & Diff Evaluation
  const snapshots = Array.isArray(input.snapshots) ? input.snapshots : [];
  const hasSnapshots = snapshots.length > 0 || !!prop.isPublished;
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
  } else if (input.draftData && latestSnapshot?.data) {
    diffResult = calculateChanges(input.draftData, latestSnapshot.data);
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
  if (input.localDraftData) {
    draftState = 'UNSAVED_LOCAL';
  } else if (hasUnpublishedChanges) {
    draftState = 'DIRTY';
  }

  const todayFocus: TodayFocusItem[] = [
    {
      id: 'brand',
      title: 'Review Property Brand & Info',
      description: 'Confirm hotel name, hero banner, and description.',
      href: '/manager/experience',
      completed: readiness.isBrandReady,
      priority: 1
    },
    {
      id: 'contacts',
      title: 'Set Guest Emergency & Reception Contact',
      description: 'Ensure direct phone numbers are configured for live guest support.',
      href: '/manager/experience',
      completed: readiness.isContactsReady,
      priority: 2
    },
    {
      id: 'menu',
      title: 'Curate Dining & Beverage Menu',
      description: 'Add dishes with prices, allergens, and dietary tags.',
      href: '/manager/menu',
      completed: readiness.isMenuReady,
      priority: 3
    },
    {
      id: 'amenities',
      title: 'List Hotel Amenities & Facilities',
      description: 'Add pool, gym, Wi-Fi, and dining service hours.',
      href: '/manager/amenities',
      completed: readiness.isAmenitiesReady,
      priority: 4
    },
    {
      id: 'rules',
      title: 'Configure House Rules & Check-in Times',
      description: 'Set check-in/out hours, quiet times, and guest policies.',
      href: '/manager/house-rules',
      completed: readiness.isRulesReady,
      priority: 5
    }
  ];

  return {
    completionPercentage,
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
    blockingIssues: readiness.blockingIssues,
    propertyReadiness: readiness,
    todayFocus,
    diffResult,
    changeCounts
  };
}

export interface LaunchChecklistItem {
  id: string;
  label: string;
  category: 'Branding' | 'Content' | 'Policies' | 'Operations';
  completed: boolean;
  details: string;
  href: string;
}

export interface LaunchChecklistResult {
  items: LaunchChecklistItem[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  isReadyToGoLive: boolean;
}

export function calculateLaunchChecklist(prop: any, snapshots?: any[]): LaunchChecklistResult {
  if (!prop) {
    return {
      items: [],
      completedCount: 0,
      totalCount: 11,
      percentage: 0,
      isReadyToGoLive: false
    };
  }

  const contacts = safeParseJson(prop.contacts);
  const rules = safeParseJson(prop.hotelRules || prop.houseRules);
  const categories = Array.isArray(prop.categories) ? prop.categories : [];
  const dishes = categories.flatMap((c: any) => (Array.isArray(c?.dishes) ? c.dishes : []));
  const amenities = Array.isArray(prop.amenities) ? prop.amenities : [];
  const snapshotsArr = Array.isArray(snapshots) ? snapshots : [];
  const isPublished = snapshotsArr.length > 0 || Boolean(prop.isPublished);

  const hasLogo = Boolean(prop.logoUrl && prop.logoUrl.trim());
  const hasBanner = Boolean((prop.bannerUrl && prop.bannerUrl.trim()) || (prop.heroImage && prop.heroImage.trim()));
  const hasAddress = Boolean((prop.description && prop.description.trim()) || (prop.name && prop.name.trim().length >= 3));
  const hasReception = Boolean(
    (prop.receptionPhone && prop.receptionPhone.trim()) || 
    (prop.emergencyPhone && prop.emergencyPhone.trim()) ||
    (contacts.reception && contacts.reception.trim()) ||
    (contacts.phone && contacts.phone.trim())
  );
  const hasAmenities = amenities.length > 0;
  const hasMenu = categories.length > 0 && dishes.length > 0;
  const hasRules = Boolean(
    (prop.checkInTime && prop.checkInTime.trim()) ||
    (prop.checkOutTime && prop.checkOutTime.trim()) ||
    (rules.quietHours && rules.quietHours.trim()) ||
    (rules.smokingPolicy && rules.smokingPolicy.trim()) ||
    (rules.petPolicy && rules.petPolicy.trim()) ||
    (typeof prop.hotelRules === 'string' && prop.hotelRules.trim()) ||
    (typeof prop.houseRules === 'string' && prop.houseRules.trim())
  );
  const hasQrPublished = isPublished;
  const hasPreviewVerified = Boolean(prop.previewToken && prop.previewToken.trim());
  const hasGuestContacts = Boolean(
    (contacts.whatsapp && contacts.whatsapp.trim()) || 
    (contacts.email && contacts.email.trim()) ||
    (prop.housekeepingPhone && prop.housekeepingPhone.trim())
  );
  const hasAnalyticsActive = Boolean(prop.firstScanAt || prop.firstMenuAt || prop.onboardedAt || isPublished);

  const items: LaunchChecklistItem[] = [
    {
      id: 'logo',
      label: 'Logo',
      category: 'Branding',
      completed: hasLogo,
      details: hasLogo ? 'Property brand logo uploaded' : 'Upload your official hotel/resort logo',
      href: '/manager/property'
    },
    {
      id: 'cover',
      label: 'Cover Image',
      category: 'Branding',
      completed: hasBanner,
      details: hasBanner ? 'High-resolution hero banner configured' : 'Add a welcoming hero image',
      href: '/manager/property'
    },
    {
      id: 'address',
      label: 'Address & Description',
      category: 'Branding',
      completed: hasAddress,
      details: hasAddress ? 'Property location & summary set' : 'Provide property overview and location',
      href: '/manager/property'
    },
    {
      id: 'contacts',
      label: 'Contacts',
      category: 'Operations',
      completed: hasReception,
      details: hasReception ? 'Reception / emergency contact active' : 'Set front desk phone for guest support',
      href: '/manager/property'
    },
    {
      id: 'amenities',
      label: 'Amenities',
      category: 'Content',
      completed: hasAmenities,
      details: hasAmenities ? `${amenities.length} hotel amenities configured` : 'Add Wi-Fi, pool, gym or spa details',
      href: '/manager/amenities'
    },
    {
      id: 'menu',
      label: 'Menu',
      category: 'Content',
      completed: hasMenu,
      details: hasMenu ? `${dishes.length} dishes across ${categories.length} categories` : 'Add food & drink categories and dishes',
      href: '/manager/menu'
    },
    {
      id: 'house_rules',
      label: 'House Rules',
      category: 'Policies',
      completed: hasRules,
      details: hasRules ? 'Check-in/out times & policies defined' : 'Configure timings, quiet hours & guidelines',
      href: '/manager/house-rules'
    },
    {
      id: 'qr_published',
      label: 'QR Published',
      category: 'Operations',
      completed: hasQrPublished,
      details: hasQrPublished ? 'Live snapshot deployed & QR code ready' : 'Publish your property live to activate QR',
      href: '/manager/publishing'
    },
    {
      id: 'preview_verified',
      label: 'Preview Verified',
      category: 'Operations',
      completed: hasPreviewVerified,
      details: hasPreviewVerified ? 'Mobile guest preview token active' : 'Test the guest experience in Preview Mode',
      href: `/preview/${prop.previewToken || prop.slug}`
    },
    {
      id: 'guest_contacts',
      label: 'Guest Contacts',
      category: 'Operations',
      completed: hasGuestContacts,
      details: hasGuestContacts ? 'Direct WhatsApp/Email support enabled' : 'Add WhatsApp or email for instant guest messaging',
      href: '/manager/property'
    },
    {
      id: 'analytics_active',
      label: 'Analytics Active',
      category: 'Operations',
      completed: hasAnalyticsActive,
      details: hasAnalyticsActive ? 'Interaction tracking and audit logging enabled' : 'Ready to record guest scans and actions',
      href: '/manager/home'
    }
  ];

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isReadyToGoLive = completedCount >= 8 && hasReception && (hasAmenities || hasMenu);

  return {
    items,
    completedCount,
    totalCount,
    percentage,
    isReadyToGoLive
  };
}

