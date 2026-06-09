import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;

    const userId = payload.sub;
    const email = payload.email as string;

    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token payload' } });
      return;
    }

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, email: email ?? '', name: email?.split('@')[0] ?? 'User', emailVerified: true },
      });
    }

    req.userId = userId;
    req.userEmail = email;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}
