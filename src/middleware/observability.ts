import pino from 'pino';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: pino.Logger;
    }
  }
}

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export const observabilityMiddleware = pinoHttp({
  logger,
  genReqId: function (req, res) {
    const existingId = req.id || req.headers['x-request-id'] || req.headers['x-correlation-id'];
    if (existingId) return existingId;
    
    const id = crypto.randomUUID();
    res.setHeader('x-correlation-id', id);
    return id;
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (req.url === '/api/health/metrics') return 'silent';
    return 'info';
  },
  customSuccessMessage: function (req, res) {
    if (res.statusCode === 404) return 'Not Found';
    return `request completed`;
  },
  customErrorMessage: function (req, res, err) {
    return `request errored`;
  }
});
