import { detectSensitiveContent } from "./sensitiveContent";
import { calculatePropertyStatus } from "./propertyStatusEngine";

export interface ValidationResult {
  valid: boolean;
  isValid: boolean; // Alias for test compatibility
  errors: string[];
  fieldErrors: Record<string, string>;
}

export interface PublishBlockingIssue {
  id: string;
  title: string;
  why: string;
  fixHref: string;
  severity: 'error' | 'warning';
}

export interface PublishValidationResult {
  canPublish: boolean;
  issues: PublishBlockingIssue[];
}

// Regex patterns
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_DIGITS_REGEX = /^\+?[0-9\s\-\(\)\.]{7,25}$/;
export function isValidPhoneNumber(phone?: string | null): boolean {
  if (!phone || !phone.trim()) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return PHONE_DIGITS_REGEX.test(phone.trim()) && digitsOnly.length >= 7 && digitsOnly.length <= 16;
}
export const URL_REGEX = /^(?:https?:\/\/|\/|data:image\/)[a-zA-Z0-9\-\._~:/?#\[\]@!$&'()*+,;=]+$/i;
export const SCRIPT_OR_HTML_REGEX = /<[a-z/][\s\S]*>/i;
export const SQL_INJECTION_REGEX = /(?:union\s+select|insert\s+into|drop\s+table|delete\s+from|update\s+.*\s+set)/i;
export const REPEATED_PUNCTUATION_REGEX = /[!?.,]{3,}/;

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

export function validateAmenity(data: { name: string; description?: string; icon?: string }, existingList: { id?: string; name: string }[] = []): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];
  const name = (data.name || "").trim();

  if (!name || name.length < 2) {
    fieldErrors.name = "Amenity name must be at least 2 characters.";
    errorList.push(fieldErrors.name);
  } else if (name.length > 50) {
    fieldErrors.name = "Amenity name cannot exceed 50 characters.";
    errorList.push(fieldErrors.name);
  } else if (SCRIPT_OR_HTML_REGEX.test(name)) {
    fieldErrors.name = "HTML or script tags are not allowed.";
    errorList.push(fieldErrors.name);
  } else if (SQL_INJECTION_REGEX.test(name)) {
    fieldErrors.name = "Invalid characters or database keywords in name.";
    errorList.push(fieldErrors.name);
  } else if (REPEATED_PUNCTUATION_REGEX.test(name)) {
    fieldErrors.name = "Avoid excessive repeated punctuation (e.g. '!!!' or '???').";
    errorList.push(fieldErrors.name);
  }

  // Check duplicates
  if (name && existingList.length > 0) {
    const isDuplicate = existingList.some(item => item.name.trim().toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      fieldErrors.name = `Amenity "${name}" already exists.`;
      errorList.push(fieldErrors.name);
    }
  }

  if (data.description) {
    if (data.description.length > 300) {
      fieldErrors.description = "Amenity description cannot exceed 300 characters.";
      errorList.push(fieldErrors.description);
    } else if (SCRIPT_OR_HTML_REGEX.test(data.description)) {
      fieldErrors.description = "HTML or script tags are not allowed in description.";
      errorList.push(fieldErrors.description);
    }
  }

  const sensitive = detectSensitiveContent(data);
  if (sensitive.detected) {
    fieldErrors.name = `Sensitive content detected: ${sensitive.samples.join(', ')}`;
    errorList.push(fieldErrors.name);
  }

  const isValid = errorList.length === 0;
  return {
    valid: isValid,
    isValid,
    errors: errorList,
    fieldErrors
  };
}
export const validateAmenityInput = validateAmenity;

export function validateCategory(data: { name: string }, existingList: { id?: string; name: string }[] = []): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];
  const name = (data.name || "").trim();

  if (!name || name.length < 1) {
    fieldErrors.name = "Category name is required.";
    errorList.push(fieldErrors.name);
  } else if (name.length > 30) {
    fieldErrors.name = "Category name cannot exceed 30 characters.";
    errorList.push(fieldErrors.name);
  } else if (SCRIPT_OR_HTML_REGEX.test(name)) {
    fieldErrors.name = "HTML or script tags are not allowed.";
    errorList.push(fieldErrors.name);
  }

  // Check duplicates
  if (name && existingList.length > 0) {
    const isDuplicate = existingList.some(item => item.name.trim().toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      fieldErrors.name = `Category "${name}" already exists.`;
      errorList.push(fieldErrors.name);
    }
  }

  const sensitive = detectSensitiveContent(data);
  if (sensitive.detected) {
    fieldErrors.name = `Sensitive content detected: ${sensitive.samples.join(', ')}`;
    errorList.push(fieldErrors.name);
  }

  const isValid = errorList.length === 0;
  return {
    valid: isValid,
    isValid,
    errors: errorList,
    fieldErrors
  };
}
export const validateCategoryInput = validateCategory;

export function validateDish(data: { name: string; price: number | string; description?: string }): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];
  const name = (data.name || "").trim();

  if (!name || name.length < 2) {
    fieldErrors.name = "Dish name must be at least 2 characters.";
    errorList.push(fieldErrors.name);
  } else if (name.length > 80) {
    fieldErrors.name = "Dish name cannot exceed 80 characters.";
    errorList.push(fieldErrors.name);
  } else if (SCRIPT_OR_HTML_REGEX.test(name)) {
    fieldErrors.name = "HTML or script tags are not allowed.";
    errorList.push(fieldErrors.name);
  }

  const numPrice = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
  if (isNaN(numPrice) || numPrice < 0) {
    fieldErrors.price = "Dish price must be a non-negative number";
    errorList.push(fieldErrors.price);
  } else if (numPrice > 100000) {
    fieldErrors.price = "Dish price is too high.";
    errorList.push(fieldErrors.price);
  }

  if (data.description) {
    if (data.description.length > 500) {
      fieldErrors.description = "Dish description cannot exceed 500 characters.";
      errorList.push(fieldErrors.description);
    } else if (SCRIPT_OR_HTML_REGEX.test(data.description)) {
      fieldErrors.description = "HTML or script tags are not allowed in description.";
      errorList.push(fieldErrors.description);
    }
  }

  const sensitive = detectSensitiveContent(data);
  if (sensitive.detected) {
    fieldErrors.name = `Sensitive content detected: ${sensitive.samples.join(', ')}`;
    errorList.push(fieldErrors.name);
  }

  const isValid = errorList.length === 0;
  return {
    valid: isValid,
    isValid,
    errors: errorList,
    fieldErrors
  };
}
export const validateDishInput = validateDish;

export function validateProperty(data: any): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    fieldErrors.name = "Property name must be at least 2 characters.";
    errorList.push(fieldErrors.name);
  } else if (data.name.length > 100) {
    fieldErrors.name = "Property name cannot exceed 100 characters.";
    errorList.push(fieldErrors.name);
  } else if (SCRIPT_OR_HTML_REGEX.test(data.name)) {
    fieldErrors.name = "HTML or script tags are not allowed.";
    errorList.push(fieldErrors.name);
  }

  if (data.receptionPhone && !PHONE_DIGITS_REGEX.test(data.receptionPhone.trim())) {
    fieldErrors.receptionPhone = "Please enter a valid phone number (at least 10 digits).";
    errorList.push(fieldErrors.receptionPhone);
  }

  if (data.emergencyPhone && !PHONE_DIGITS_REGEX.test(data.emergencyPhone.trim())) {
    fieldErrors.emergencyPhone = "Please enter a valid emergency phone number.";
    errorList.push(fieldErrors.emergencyPhone);
  }

  if (data.housekeepingPhone && !PHONE_DIGITS_REGEX.test(data.housekeepingPhone.trim())) {
    fieldErrors.housekeepingPhone = "Please enter a valid housekeeping phone number.";
    errorList.push(fieldErrors.housekeepingPhone);
  }

  const contacts = safeParseJson(data.contacts);
  if (contacts.email && !EMAIL_REGEX.test(contacts.email.trim())) {
    fieldErrors.email = "Please enter a valid email address.";
    errorList.push(fieldErrors.email);
  }
  if (contacts.phone && !PHONE_DIGITS_REGEX.test(contacts.phone.trim())) {
    fieldErrors.phone = "Please enter a valid contact phone number.";
    errorList.push(fieldErrors.phone);
  }
  if (contacts.whatsapp && !PHONE_DIGITS_REGEX.test(contacts.whatsapp.trim())) {
    fieldErrors.whatsapp = "Please enter a valid WhatsApp phone number.";
    errorList.push(fieldErrors.whatsapp);
  }
  if (contacts.website && !URL_REGEX.test(contacts.website.trim())) {
    fieldErrors.website = "Please enter a valid website URL (e.g. https://myhotel.com).";
    errorList.push(fieldErrors.website);
  }

  if (data.logoUrl && !URL_REGEX.test(data.logoUrl.trim())) {
    fieldErrors.logoUrl = "Invalid logo image URL.";
    errorList.push(fieldErrors.logoUrl);
  }
  if (data.bannerUrl && !URL_REGEX.test(data.bannerUrl.trim())) {
    fieldErrors.bannerUrl = "Invalid banner image URL.";
    errorList.push(fieldErrors.bannerUrl);
  }

  const sensitive = detectSensitiveContent(data);
  if (sensitive.detected) {
    fieldErrors.general = `Sensitive content detected: ${sensitive.samples.join(', ')}`;
    errorList.push(fieldErrors.general);
  }

  const isValid = errorList.length === 0;
  return {
    valid: isValid,
    isValid,
    errors: errorList,
    fieldErrors
  };
}
export const validatePropertyInput = validateProperty;

export function validateForPublish(data: {
  property: any;
  categories?: any[];
  amenities?: any[];
}): PublishValidationResult {
  const prop = data.property || {};
  const categories = Array.isArray(data.categories) ? data.categories : (Array.isArray(prop.categories) ? prop.categories : []);
  const amenities = Array.isArray(data.amenities) ? data.amenities : (Array.isArray(prop.amenities) ? prop.amenities : []);
  const propWithEntities = { ...prop, categories, amenities };
  
  // Single source of truth status calculation
  // Dynamic require / import avoided by checking conditions or importing calculatePropertyStatus
  const status = calculatePropertyStatus(propWithEntities);
  const issues: PublishBlockingIssue[] = status.blockingIssues.map(b => ({
    id: b.id,
    title: b.label,
    why: b.why,
    fixHref: b.href,
    severity: b.severity
  }));

  // Sensitive content check
  const sensitive = detectSensitiveContent({ property: prop, categories, amenities });
  if (sensitive.detected) {
    issues.push({
      id: 'sensitive_content',
      title: 'Sensitive Content Detected',
      why: `Found: ${sensitive.samples.join(', ')}. Passwords and API tokens cannot be published.`,
      fixHref: '/manager/property',
      severity: 'error'
    });
  }

  return {
    canPublish: issues.length === 0,
    issues
  };
}

export function sanitizePublicInput(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/union\s+select/gi, '')
    .replace(/drop\s+table/gi, '')
    .replace(/delete\s+from/gi, '')
    .trim();
}
