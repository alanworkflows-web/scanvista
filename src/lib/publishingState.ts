import { DiffResult, calculateChanges } from "./diffEngine";

export type PublishingState = 'DRAFT' | 'PUBLISHED_PENDING_CHANGES' | 'PUBLISHED_LIVE';

export interface PublishingStatus {
  state: PublishingState;
  label: string;
  subtext: string;
  badgeColor: string;
  badgeBg: string;
  isPublished: boolean;
  hasChanges: boolean;
  diffResult: DiffResult | null;
  lastPublishedAt?: string | null;
}

export function getPublishingStatus(property: any, snapshots: any[], draftData?: any): PublishingStatus {
  const snapshotsList = Array.isArray(snapshots) ? snapshots : (property?.snapshots || []);
  const isPublished = snapshotsList.length > 0;
  const latestSnapshot = snapshotsList.length > 0 ? snapshotsList[0] : null;
  const currentPublishedData = latestSnapshot?.data || null;

  let diffResult: DiffResult | null = null;
  if (isPublished && currentPublishedData && draftData) {
    diffResult = calculateChanges(draftData, currentPublishedData);
  } else if (!isPublished) {
    diffResult = { hasChanges: true, messages: ['Property has not been published yet.'] };
  }

  const hasChanges = diffResult ? diffResult.hasChanges : !isPublished;
  const lastPublishedAt = latestSnapshot?.publishedAt || latestSnapshot?.createdAt || null;

  if (!isPublished) {
    return {
      state: 'DRAFT',
      label: 'Draft Mode',
      subtext: 'Only visible via preview link. Not published to guests.',
      badgeColor: 'text-amber-700 border-amber-300 bg-amber-50',
      badgeBg: 'bg-amber-500',
      isPublished: false,
      hasChanges: true,
      diffResult,
      lastPublishedAt
    };
  }

  if (hasChanges) {
    return {
      state: 'PUBLISHED_PENDING_CHANGES',
      label: 'Live with Changes Pending',
      subtext: 'Previous version is live. New changes ready to publish.',
      badgeColor: 'text-blue-700 border-blue-300 bg-blue-50',
      badgeBg: 'bg-blue-500',
      isPublished: true,
      hasChanges: true,
      diffResult,
      lastPublishedAt
    };
  }

  return {
    state: 'PUBLISHED_LIVE',
    label: 'Live',
    subtext: 'All changes are live for guests.',
    badgeColor: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    badgeBg: 'bg-emerald-500',
    isPublished: true,
    hasChanges: false,
    diffResult,
    lastPublishedAt
  };
}
