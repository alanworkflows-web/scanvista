import { describe, it, expect } from 'vitest';
import { getPropertyStatus, calculatePropertyReadiness } from '../src/lib/propertyStatusEngine';
import { detectSensitiveContent, sanitizeField } from '../src/lib/sensitiveContent';
import { 
  validateAmenityInput, 
  validateCategoryInput, 
  validateDishInput, 
  validatePropertyInput,
  sanitizePublicInput
} from '../src/lib/validationFramework';

describe('P0.1 Single Status Engine', () => {
  const baseProperty: any = {
    id: 'prop-1',
    slug: 'grand-hotel',
    name: 'Grand Hotel',
    tagline: 'Luxury Stay',
    receptionPhone: '+1-555-0100',
    hotelRules: 'No smoking indoors.',
    categories: [
      { id: 'cat-1', name: 'Breakfast', dishes: [{ id: 'd-1', name: 'Pancakes', price: 12 }] }
    ],
    amenities: [
      { id: 'am-1', name: 'Infinity Pool', icon: '🏊' }
    ]
  };

  it('Calculates 100% readiness when all core domains are configured', () => {
    const readiness = calculatePropertyReadiness(baseProperty);
    expect(readiness.isBrandReady).toBe(true);
    expect(readiness.isMenuReady).toBe(true);
    expect(readiness.isAmenitiesReady).toBe(true);
    expect(readiness.isContactsReady).toBe(true);
    expect(readiness.isRulesReady).toBe(true);
    expect(readiness.blockingIssues).toHaveLength(0);
  });

  it('Identifies blocking issues when critical fields are missing', () => {
    const incompleteProperty = {
      ...baseProperty,
      name: '',
      receptionPhone: undefined,
      categories: [],
      amenities: []
    };
    const readiness = calculatePropertyReadiness(incompleteProperty);
    expect(readiness.isBrandReady).toBe(false);
    expect(readiness.isMenuReady).toBe(false);
    expect(readiness.isAmenitiesReady).toBe(false);
    expect(readiness.blockingIssues.length).toBeGreaterThan(0);
  });

  it('Unifies publish status to Published (Up to date) when snapshots match draft', () => {
    const status = getPropertyStatus({
      property: baseProperty,
      snapshots: [{ publishedAt: new Date().toISOString(), data: { property: baseProperty } }],
      draftData: { property: baseProperty }
    });
    expect(status.hasUnpublishedChanges).toBe(false);
    expect(status.badgeLabel).toBe('Published');
  });

  it('Identifies unpublished changes when draft has modified items', () => {
    const draftData = {
      property: { ...baseProperty, name: 'Grand Hotel & Spa' },
      amenities: [{ id: 'am-1', name: 'Infinity Pool' }, { id: 'am-2', name: 'Spa' }]
    };
    const status = getPropertyStatus({
      property: baseProperty,
      snapshots: [{ publishedAt: '2026-01-01', data: { property: baseProperty, amenities: [{ id: 'am-1', name: 'Infinity Pool' }] } }],
      draftData
    });
    expect(status.hasUnpublishedChanges).toBe(true);
    expect(status.badgeLabel).toBe('Draft Changes Pending');
    expect(status.changeCounts.amenities).toBe(1);
  });
});

describe('P0.2 Sensitive Content Protection', () => {
  it('Detects and flags OpenAI secret keys', () => {
    const payload = {
      description: 'Check out our property! sk-proj-abcdef1234567890abcdef1234567890'
    };
    const check = detectSensitiveContent(payload);
    expect(check.detected).toBe(true);
    expect(check.reason).toContain('Key');
  });

  it('Detects AWS Access Keys and generic passwords', () => {
    const payload = {
      wifiPassword: 'guest123',
      notes: 'AKIAIOSFODNN7EXAMPLE is our access key. password = super_secret_pass'
    };
    const check = detectSensitiveContent(payload);
    expect(check.detected).toBe(true);
  });

  it('Does not false-positive on standard guest wifi or public numbers', () => {
    const cleanPayload = {
      name: 'Sunset Lodge',
      wifiNetwork: 'Sunset_Guest_5G',
      wifiPassword: 'WelcomeToSunset2026',
      receptionPhone: '+1 (555) 234-5678',
      description: 'A tranquil getaway nestled in the pine hills.'
    };
    const check = detectSensitiveContent(cleanPayload);
    expect(check.detected).toBe(false);
  });

  it('Sanitizes string inputs safely by stripping HTML & scripts', () => {
    const raw = '  <b>Luxury Hotel</b> <script>alert("xss")</script> ';
    const sanitized = sanitizeField(raw);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('<b>');
    expect(sanitized).toBe('Luxury Hotel');
  });
});

describe('P0.3 Validation Framework', () => {
  it('Validates clean amenity input', () => {
    const result = validateAmenityInput({
      name: 'Rooftop Heated Pool',
      description: 'Open daily with city skyline views.'
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('Rejects amenity input exceeding max length or containing script tags', () => {
    const result = validateAmenityInput({
      name: '<script>doBad()</script>',
      description: 'A'.repeat(500)
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('Validates clean dish input and rejects negative prices', () => {
    const validDish = validateDishInput({
      name: 'Truffle Mushroom Risotto',
      price: 24.50,
      description: 'Arborio rice with wild mushrooms and parmesan.'
    });
    expect(validDish.isValid).toBe(true);

    const invalidDish = validateDishInput({
      name: 'T',
      price: -5
    });
    expect(invalidDish.isValid).toBe(false);
    expect(invalidDish.errors).toContain('Dish price must be a non-negative number');
  });

  it('Validates clean category input and checks max lengths', () => {
    const validCat = validateCategoryInput({ name: 'Appetizers' });
    expect(validCat.isValid).toBe(true);

    const invalidCat = validateCategoryInput({ name: 'This is an excessively long category name that exceeds limits' });
    expect(invalidCat.isValid).toBe(false);
  });

  it('Sanitizes HTML and SQL injection patterns in public input', () => {
    const raw = 'Normal text <img src=x onerror=alert(1)> and UNION SELECT * FROM users';
    const clean = sanitizePublicInput(raw);
    expect(clean).not.toContain('<img');
    expect(clean).not.toContain('UNION SELECT');
  });
});
