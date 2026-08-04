const SENSITIVE_PATTERNS = [
  { name: "Password assignment", regex: /(?:password|passwd|pwd)\s*[:=\s-]\s*['"]?[^\s,;'"]{3,}['"]?/i },
  { name: "API Key", regex: /(?:api[_-]?key|apikey)\s*[:=\s-]\s*['"]?[^\s,;'"]{3,}['"]?/i },
  { name: "OpenAI / AI Secret Key", regex: /sk-(?:proj-)?[a-zA-Z0-9_-]{16,}/i },
  { name: "Stripe / Payment Live Key", regex: /sk_(?:live|test)_[0-9a-zA-Z_-]{4,}/i },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/i },
  { name: "AWS Secret Key", regex: /(?:aws_secret_access_key|aws_secret|aws_key|aws_[a-zA-Z0-9_]+)\s*[:=\s-]\s*['"]?[^\s,;'"]{3,}['"]?/i },
  { name: "Secret Key/Token", regex: /(?:secret|token|auth[_-]?token)\s*[:=\s-]\s*['"]?[^\s,;'"]{3,}['"]?/i },
  { name: "Bearer Token", regex: /bearer\s+[a-zA-Z0-9_\-\.]{6,}/i },
  { name: "Private Key", regex: /(?:-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|private\s+key\s*[:=\s-]?)/i },
  { name: "Database Connection String", regex: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/i },
  { name: "GitHub Token", regex: /gh[pousr]_[0-9a-zA-Z]{16,}/i }
];

export interface SensitiveDetectionResult {
  detected: boolean;
  reason?: string;
  samples: string[];
}

export function detectSensitiveContent(input: any): SensitiveDetectionResult {
  if (!input) return { detected: false, samples: [] };

  const stringsToTest: string[] = [];

  function extractStrings(obj: any) {
    if (typeof obj === 'string') {
      stringsToTest.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(extractStrings);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        extractStrings(obj[key]);
      }
    }
  }

  extractStrings(input);

  const matchedSamples: string[] = [];
  let primaryReason: string | undefined;

  for (const text of stringsToTest) {
    for (const pattern of SENSITIVE_PATTERNS) {
      const match = text.match(pattern.regex);
      if (match) {
        if (!primaryReason) primaryReason = pattern.name;
        // Redact sample
        const fullMatch = match[0];
        const redacted = fullMatch.length > 8 
          ? `${fullMatch.substring(0, 4)}...${fullMatch.substring(fullMatch.length - 2)}` 
          : '***';
        matchedSamples.push(`Detected ${pattern.name} (${redacted})`);
      }
    }
  }

  return {
    detected: matchedSamples.length > 0,
    reason: primaryReason,
    samples: matchedSamples
  };
}

export function sanitizeField(val: string): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
