import { describe, it, expect } from 'vitest';
import { calculateLaunchChecklist, getPropertyStatus } from '../src/lib/propertyStatusEngine';
import { detectSensitiveContent } from '../src/lib/sensitiveContent';
import { 
  validateAmenityInput, 
  validateCategoryInput, 
  validateDishInput, 
  validatePropertyInput,
  sanitizePublicInput
} from '../src/lib/validationFramework';

describe('Launch Checklist & Release Verification Suite', () => {
  const completeProperty: any = {
    id: 'prop-full',
    slug: 'grand-azure-resort',
    name: 'Grand Azure Resort',
    tagline: 'Oceanfront Luxury',
    description: '100 Ocean Blvd, Miami, FL',
    logoUrl: 'https://cdn.example.com/logo.png',
    bannerUrl: 'https://cdn.example.com/hero.jpg',
    receptionPhone: '+1-305-555-0199',
    housekeepingPhone: '+1-305-555-0188',
    emergencyPhone: '+1-305-555-0911',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    contacts: JSON.stringify({
      whatsapp: '+1-305-555-0199',
      email: 'concierge@grandazure.com',
      reception: '+1-305-555-0199'
    }),
    hotelRules: JSON.stringify({
      quietHours: '22:00 - 07:00',
      smokingPolicy: 'Strictly non-smoking property',
      petPolicy: 'Pet-friendly with deposit'
    }),
    previewToken: 'prev-token-12345',
    isPublished: true,
    categories: [
      { 
        id: 'cat-1', 
        name: 'Fine Dining', 
        dishes: [{ id: 'd-1', name: 'Chilean Sea Bass', price: 42 }] 
      }
    ],
    amenities: [
      { id: 'am-1', name: 'Infinity Pool', icon: '🏊' },
      { id: 'am-2', name: 'Spa & Wellness', icon: '💆' }
    ]
  };

  it('1. Computes 100% and Ready to Go Live for a completely configured property', () => {
    const checklist = calculateLaunchChecklist(completeProperty, [{ id: 'snap-1' }]);
    expect(checklist.totalCount).toBe(11);
    expect(checklist.completedCount).toBe(11);
    expect(checklist.percentage).toBe(100);
    expect(checklist.isReadyToGoLive).toBe(true);

    const missing = checklist.items.filter(i => !i.completed);
    expect(missing).toHaveLength(0);
  });

  it('2. Correctly flags missing milestones for a fresh/incomplete property', () => {
    const incompleteProperty: any = {
      id: 'prop-empty',
      slug: 'empty-lodge',
      name: 'Empty Lodge',
      categories: [],
      amenities: []
    };

    const checklist = calculateLaunchChecklist(incompleteProperty, []);
    expect(checklist.completedCount).toBeLessThan(5);
    expect(checklist.isReadyToGoLive).toBe(false);

    const logoItem = checklist.items.find(i => i.id === 'logo');
    expect(logoItem?.completed).toBe(false);

    const menuItem = checklist.items.find(i => i.id === 'menu');
    expect(menuItem?.completed).toBe(false);

    const contactsItem = checklist.items.find(i => i.id === 'contacts');
    expect(contactsItem?.completed).toBe(false);
  });

  it('3. Hard-blocks and detects all sensitive tokens', () => {
    const testCases = [
      { key: 'password=123', input: 'Admin config password=123 in description' },
      { key: 'token=abc', input: 'API endpoint with token=abc123456789' },
      { key: 'BEGIN PRIVATE KEY', input: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk' },
      { key: 'sk_live_', input: 'Payment gateway key sk_live_TESTONLY_not_a_real_key' },
      { key: 'AWS_SECRET', input: 'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' },
      { key: 'Bearer', input: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' }
    ];

    for (const { key, input } of testCases) {
      const propWithSecret = {
        ...completeProperty,
        description: input
      };
      const result = detectSensitiveContent(propWithSecret);
      expect(result.detected, `Should detect sensitive token for: ${key}`).toBe(true);
      expect(result.samples.length).toBeGreaterThan(0);
    }
  });

  it('4. Enforces validation rules on edge cases', () => {
    // 1-character amenity (must fail)
    expect(validateAmenityInput({ name: 'A', icon: '🏊' }).isValid).toBe(false);

    // 100-character amenity (must pass if under limit, or fail if exceeds max 80)
    expect(validateAmenityInput({ name: 'A'.repeat(85), icon: '🏊' }).isValid).toBe(false);
    expect(validateAmenityInput({ name: 'High-speed Fiber Wireless Wi-Fi', icon: '📶' }).isValid).toBe(true);

    // Script tags / HTML injection
    expect(validateAmenityInput({ name: '<script>alert(1)</script>' }).isValid).toBe(false);
    expect(validateCategoryInput({ name: '<script src="evil.js"></script>' }).isValid).toBe(false);
    expect(validateDishInput({ name: 'Pasta', price: 10, description: '<img src=x onerror=alert(1)>' }).isValid).toBe(false);

    // SQL injection keywords
    expect(validateAmenityInput({ name: "Pool' UNION SELECT * FROM users--" }).isValid).toBe(false);

    // Invalid email / phone in property input
    expect(validatePropertyInput({ name: 'Hotel', contacts: { email: 'not-an-email' } }).isValid).toBe(false);
    expect(validatePropertyInput({ name: 'Hotel', contacts: { phone: 'abc' } }).isValid).toBe(false);
  });

  it('5. Verifies Snapshot consistency parity between Manager, Draft, and Published state', () => {
    const liveSnapshot = {
      id: 'snap-1',
      publishedAt: '2026-08-01T12:00:00Z',
      data: {
        property: completeProperty,
        categories: completeProperty.categories,
        amenities: completeProperty.amenities
      }
    };

    // When manager state matches live snapshot
    const cleanStatus = getPropertyStatus({
      property: completeProperty,
      snapshots: [liveSnapshot],
      draftData: liveSnapshot.data
    });

    expect(cleanStatus.publishState).toBe('PUBLISHED');
    expect(cleanStatus.hasUnpublishedChanges).toBe(false);
    expect(cleanStatus.changeCounts.total).toBe(0);

    // When manager edits amenities
    const modifiedDraft = {
      ...liveSnapshot.data,
      amenities: [
        ...completeProperty.amenities,
        { id: 'am-3', name: 'Rooftop Bar' }
      ]
    };

    const dirtyStatus = getPropertyStatus({
      property: completeProperty,
      snapshots: [liveSnapshot],
      draftData: modifiedDraft
    });

    expect(dirtyStatus.publishState).toBe('PUBLISHED_PENDING_CHANGES');
    expect(dirtyStatus.hasUnpublishedChanges).toBe(true);
    expect(dirtyStatus.changeCounts.amenities).toBeGreaterThanOrEqual(1);
  });
});
