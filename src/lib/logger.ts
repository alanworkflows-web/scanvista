export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevelStr = process.env.LOG_LEVEL?.toUpperCase() || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');
const currentLevel = LEVELS[currentLevelStr as LogLevel] ?? LEVELS.INFO;

const SENSITIVE_KEYS = ['password', 'secret', 'token', 'cookie', 'authorization', 'email', 'name', 'client_id', 'client_secret', 'api_key'];

function sanitize(obj: any, depth = 0): any {
  if (depth > 5) return '[Max Depth Reached]';
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item, depth + 1));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k));
    if (isSensitive && value) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitize(value, depth + 1);
    }
  }
  return sanitized;
}

function formatMessage(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  let metaStr = '';
  if (meta !== undefined) {
    if (meta instanceof Error) {
      metaStr = `\n${meta.stack || meta.message}`;
    } else {
      const sanitizedMeta = sanitize(meta);
      metaStr = typeof sanitizedMeta === 'object' ? `\n${JSON.stringify(sanitizedMeta, null, 2)}` : ` ${sanitizedMeta}`;
    }
  }
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  debug: (message: string, meta?: any) => {
    if (currentLevel <= LEVELS.DEBUG) console.debug(formatMessage('DEBUG', message, meta));
  },
  info: (message: string, meta?: any) => {
    if (currentLevel <= LEVELS.INFO) console.info(formatMessage('INFO', message, meta));
  },
  warn: (message: string, meta?: any) => {
    if (currentLevel <= LEVELS.WARN) console.warn(formatMessage('WARN', message, meta));
  },
  error: (message: string, meta?: any) => {
    if (currentLevel <= LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  }
};
