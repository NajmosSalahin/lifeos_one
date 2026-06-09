import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const JWKS = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

const ISSUER = `${env.SUPABASE_URL}/auth/v1`;

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER });

    const userId = typeof payload.sub === 'string' ? payload.sub : undefined;
    const email = typeof payload.email === 'string' ? payload.email : '';

    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token payload' } });
      return;
    }

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, email, name: email?.split('@')[0] ?? 'User', emailVerified: true },
      });
    }

    req.userId = userId;
    req.userEmail = email;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}
