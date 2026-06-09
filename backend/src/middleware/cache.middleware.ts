import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 15, checkperiod: 30 });

export function cacheMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET') return next();

  const key = `${(req as any).userId}:${req.originalUrl}`;
  const cached = cache.get(key);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    cache.set(key, body);
    res.setHeader('X-Cache', 'MISS');
    return originalJson(body);
  };

  next();
}
