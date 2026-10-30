import { Request, Response, NextFunction } from 'express';
import { adminAuth, isFirebaseAdminInitialized } from '../config/firebaseAdmin';
import { FirestoreDataService } from '../services/firestoreDataService';
import { sendError } from '../utils/responseHelper';
import { UserRole } from '../types';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: UserRole;
  name?: string;
  class?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local development mode without token, allow a mock demo user context
    if (!isFirebaseAdminInitialized) {
      const devRole = (req.headers['x-user-role'] as UserRole) || 'student';
      const devUid = (req.headers['x-user-id'] as string) || (devRole === 'teacher' ? 'teacher-demo-1' : 'student-demo-1');
      req.user = {
        uid: devUid,
        email: `${devRole}@mathsprint.edu`,
        role: devRole,
        name: devRole === 'teacher' ? 'Prof. Sarah Miller' : 'Alex Rivera',
        class: 'Class 10-A',
      };
      return next();
    }

    sendError(res, 'Authorization token required. Use format: Bearer <ID_TOKEN>', 401);
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // If live Firebase Admin is initialized, verify token cryptographically
  if (isFirebaseAdminInitialized && adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const userProfile = await FirestoreDataService.getUser(decoded.uid);

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: userProfile?.role || 'student',
        name: userProfile?.name || decoded.name || decoded.email?.split('@')[0] || 'User',
        class: userProfile?.class,
      };
      return next();
    } catch (err: any) {
      console.warn('[authMiddleware] Token verification failed:', err.message);
      sendError(res, `Invalid or expired Firebase ID token: ${err.message}`, 401);
      return;
    }
  }

  // Development / fallback mode token parsing
  const devRole = (req.headers['x-user-role'] as UserRole) || (token.includes('teacher') ? 'teacher' : 'student');
  const devUid = (req.headers['x-user-id'] as string) || (token.startsWith('user-') ? token : `dev-${devRole}-1`);

  req.user = {
    uid: devUid,
    email: `${devRole}@mathsprint.edu`,
    role: devRole,
    name: devRole === 'teacher' ? 'Prof. Sarah Miller' : 'Alex Rivera',
    class: 'Class 10-A',
  };
  next();
};

/**
 * Enforce Teacher-only access
 */
export const requireTeacher = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  if (req.user.role !== 'teacher') {
    sendError(res, 'Teacher access required for this operation', 403);
    return;
  }

  next();
};

/**
 * Enforce Student-only access
 */
export const requireStudent = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  if (req.user.role !== 'student') {
    sendError(res, 'Student access required for this operation', 403);
    return;
  }

  next();
};
