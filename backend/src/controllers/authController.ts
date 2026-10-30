import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { FirestoreDataService } from '../services/firestoreDataService';
import { FirestoreUser, UserRole } from '../types';

export const syncUserProfileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, role, className } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
      return sendError(res, 'Unauthenticated user', 401);
    }

    const existingUser = await FirestoreDataService.getUser(uid);

    const userRecord: FirestoreUser = {
      userId: uid,
      name: name || existingUser?.name || req.user?.name || 'User',
      email: req.user?.email || existingUser?.email || `${uid}@mathsprint.edu`,
      role: (role as UserRole) || existingUser?.role || req.user?.role || 'student',
      class: className || existingUser?.class,
      createdAt: existingUser?.createdAt || Date.now(),
    };

    await FirestoreDataService.setUser(userRecord);

    return sendSuccess(res, userRecord, 'User profile synchronized');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getMeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return sendError(res, 'Unauthenticated user', 401);
    }

    let user = await FirestoreDataService.getUser(uid);
    if (!user) {
      user = {
        userId: uid,
        name: req.user?.name || 'User',
        email: req.user?.email || `${uid}@mathsprint.edu`,
        role: req.user?.role || 'student',
        class: req.user?.class,
        createdAt: Date.now(),
      };
      await FirestoreDataService.setUser(user);
    }

    return sendSuccess(res, user);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const loginController = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  const userId = `user-${Date.now()}`;
  const userRecord: FirestoreUser = {
    userId,
    name: email.split('@')[0],
    email,
    role: role || 'student',
    createdAt: Date.now(),
  };

  await FirestoreDataService.setUser(userRecord);

  return sendSuccess(res, {
    ...userRecord,
    token: `mock-token-${userId}`,
  }, 'Logged in successfully');
};

export const registerController = async (req: AuthenticatedRequest, res: Response) => {
  const { email, name, role, className } = req.body;
  const userId = `user-${Date.now()}`;

  const userRecord: FirestoreUser = {
    userId,
    name: name || email?.split('@')[0] || 'User',
    email: email || `${userId}@mathsprint.edu`,
    role: role || 'student',
    class: className,
    createdAt: Date.now(),
  };

  await FirestoreDataService.setUser(userRecord);

  return sendSuccess(res, userRecord, 'Registered successfully', 201);
};
