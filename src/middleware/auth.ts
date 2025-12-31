import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; orgId: string; role: 'tenant' | 'landlord' | 'admin' };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = req.headers['x-user-id'] as string;
  const orgId = req.headers['x-org-id'] as string;
  const role = req.headers['x-role'] as 'tenant' | 'landlord' | 'admin';

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; orgId: string; role: string };
      req.user = { userId: decoded.userId, orgId: decoded.orgId, role: decoded.role as any };
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else if (userId && orgId && role) {
    // Stub for Clerk/Auth0
    req.user = { userId, orgId, role };
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
};

// Helper to check role
export const requireRole = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};