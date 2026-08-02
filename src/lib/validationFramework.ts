export interface ValidationResult {
  valid: boolean;
  isValid: boolean; // Alias for test compatibility
  errors: string[];
  fieldErrors: Record<string, string>;
}

// Regex patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_DIGITS_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const URL_REGEX = /^https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/i;
const SCRIPT_OR_HTML_REGEX = /<[a-z/][\s\S]*>/i;
const SQL_INJECTION_REGEX = /(?:union\s+select|insert\s+into|drop\s+table|delete\s+from|update\s+.*\s+set)/i;
const REPEATED_PUNCTUATION_REGEX = /[!?.,]{3,}/;

export function validateAmenity(data: { name: string; description?: string }): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];
  const name = (data.name || "").trim();

  if (!name || name.length < 2) {
    fieldErrors.name = "Amenity name must be at least 2 characters.";
    errorList.push(fieldErrors.name);
  } else if (name.length > 40) {
    fieldErrors.name = "Amenity name cannot exceed 40 characters.";
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

  if (data.description && data.description.length > 300) {
    fieldErrors.description = "Amenity description cannot exceed 300 characters.";
    errorList.push(fieldErrors.description);
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

export function validateCategory(data: { name: string }): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];
  const name = (data.name || "").trim();

  if (!name || name.length < 1) {
    fieldErrors.name = "Category name is required.";
    errorList.push(fieldErrors.name);
  } else if (name.length > 25) {
    fieldErrors.name = "Category name cannot exceed 25 characters.";
    errorList.push(fieldErrors.name);
  } else if (SCRIPT_OR_HTML_REGEX.test(name)) {
    fieldErrors.name = "HTML or script tags are not allowed.";
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
  } else if (name.length > 60) {
    fieldErrors.name = "Dish name cannot exceed 60 characters.";
    errorList.push(fieldErrors.name);
  } else if (SCRIPT_OR_HTML_REGEX.test(name)) {
    fieldErrors.name = "HTML or script tags are not allowed.";
    errorList.push(fieldErrors.name);
  }

  const numPrice = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
  if (isNaN(numPrice) || numPrice < 0) {
    fieldErrors.price = "Dish price must be a non-negative number";
    errorList.push(fieldErrors.price);
  } else if (numPrice > 10000) {
    fieldErrors.price = "Dish price is too high.";
    errorList.push(fieldErrors.price);
  }

  if (data.description) {
    if (data.description.length > 300) {
      fieldErrors.description = "Dish description cannot exceed 300 characters.";
      errorList.push(fieldErrors.description);
    } else if (SCRIPT_OR_HTML_REGEX.test(data.description)) {
      fieldErrors.description = "HTML or script tags are not allowed in description.";
      errorList.push(fieldErrors.description);
    }
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
  } else if (data.name.length > 80) {
    fieldErrors.name = "Property name cannot exceed 80 characters.";
    errorList.push(fieldErrors.name);
  }

  if (data.receptionPhone && !PHONE_DIGITS_REGEX.test(data.receptionPhone.trim())) {
    fieldErrors.receptionPhone = "Please enter a valid phone number.";
    errorList.push(fieldErrors.receptionPhone);
  }

  if (data.emergencyPhone && !PHONE_DIGITS_REGEX.test(data.emergencyPhone.trim())) {
    fieldErrors.emergencyPhone = "Please enter a valid emergency phone number.";
    errorList.push(fieldErrors.emergencyPhone);
  }

  if (data.contacts && typeof data.contacts === 'object') {
    if (data.contacts.email && !EMAIL_REGEX.test(data.contacts.email.trim())) {
      fieldErrors.email = "Please enter a valid email address.";
      errorList.push(fieldErrors.email);
    }
    if (data.contacts.phone && !PHONE_DIGITS_REGEX.test(data.contacts.phone.trim())) {
      fieldErrors.phone = "Please enter a valid contact phone number.";
      errorList.push(fieldErrors.phone);
    }
    if (data.contacts.whatsapp && !PHONE_DIGITS_REGEX.test(data.contacts.whatsapp.trim())) {
      fieldErrors.whatsapp = "Please enter a valid WhatsApp phone number.";
      errorList.push(fieldErrors.whatsapp);
    }
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
