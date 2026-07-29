type ActionType = 'VIEWED' | 'EXECUTED';
type ResourceType = 'PROPERTY' | 'MENU' | 'RECOMMENDATION';

export const trackEvent = (propertyId: string, action: ActionType, resourceType: ResourceType, metadata?: any) => {
  // Fire and forget
  fetch('/api/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId, action, resourceType, metadata })
  }).catch(err => {
    console.error('Tracking failed:', err);
  });
};
