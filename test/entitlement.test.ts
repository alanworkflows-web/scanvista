import { describe, it, expect, vi } from 'vitest';
import { resolveEntitlement } from '../server.ts';

describe('Canonical Entitlement Model', () => {
  it('No subscription record resolves to Free Plan with Full Access', () => {
    const entitlement = resolveEntitlement(null);
    expect(entitlement.plan).toBe('free');
    expect(entitlement.subscriptionStatus).toBe('none');
    expect(entitlement.accessMode).toBe('full');
    expect(entitlement.canEdit).toBe(true);
    expect(entitlement.canPublish).toBe(true);
  });

  it('Explicit none status resolves to Free Plan with Full Access', () => {
    const entitlement = resolveEntitlement({ status: 'none' });
    expect(entitlement.plan).toBe('free');
    expect(entitlement.subscriptionStatus).toBe('none');
    expect(entitlement.accessMode).toBe('full');
  });

  it('Active Premium resolves to Premium Plan with Full Access', () => {
    const entitlement = resolveEntitlement({ status: 'active' });
    expect(entitlement.plan).toBe('premium');
    expect(entitlement.subscriptionStatus).toBe('active');
    expect(entitlement.accessMode).toBe('full');
    expect(entitlement.canEdit).toBe(true);
  });

  it('Trialing resolves to Premium Plan with Full Access', () => {
    const entitlement = resolveEntitlement({ status: 'trialing' });
    expect(entitlement.plan).toBe('premium');
    expect(entitlement.subscriptionStatus).toBe('trialing');
    expect(entitlement.accessMode).toBe('full');
  });

  it('Past Due resolves to Read Only', () => {
    const entitlement = resolveEntitlement({ status: 'past_due' });
    expect(entitlement.plan).toBe('premium');
    expect(entitlement.subscriptionStatus).toBe('past_due');
    expect(entitlement.accessMode).toBe('read_only');
    expect(entitlement.canEdit).toBe(false);
    expect(entitlement.canPublish).toBe(false);
  });

  it('Canceled resolves to Read Only', () => {
    const entitlement = resolveEntitlement({ status: 'canceled' });
    expect(entitlement.accessMode).toBe('read_only');
    expect(entitlement.canEdit).toBe(false);
  });

  it('Expired resolves to Read Only', () => {
    const entitlement = resolveEntitlement({ status: 'expired' });
    expect(entitlement.accessMode).toBe('read_only');
    expect(entitlement.canEdit).toBe(false);
  });
});
