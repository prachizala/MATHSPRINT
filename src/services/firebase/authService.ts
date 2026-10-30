import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../../firebase/config/firebaseConfig';
import { User, UserRole } from '../../types';
import { mockStudentUser, mockTeacherUser } from '../../data/mockData';

export class AuthService {
  static async login(email: string, password: string, role: UserRole = 'student'): Promise<User> {
    if (auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return {
          userId: credential.user.uid,
          name: credential.user.displayName || email.split('@')[0],
          email: credential.user.email || email,
          role,
          createdAt: Date.now(),
        };
      } catch (error: any) {
        console.warn('[AuthService] Firebase login failed, checking fallback:', error.message);
        throw error;
      }
    }

    // Mock fallback when Firebase keys are not yet configured
    await new Promise((resolve) => setTimeout(resolve, 600));
    return role === 'teacher'
      ? { ...mockTeacherUser, email }
      : { ...mockStudentUser, email };
  }

  static async register(
    email: string,
    password: string,
    role: UserRole,
    name: string,
    className?: string
  ): Promise<User> {
    if (auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        userId: credential.user.uid,
        name,
        email,
        role,
        class: className,
        createdAt: Date.now(),
      };
    }

    // Mock fallback
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      userId: `user-mock-${Date.now()}`,
      name,
      email,
      role,
      class: className,
      createdAt: Date.now(),
    };
  }

  static async logout(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
  }

  static subscribeToAuthState(callback: (user: FirebaseUser | null) => void): () => void {
    if (auth) {
      return onAuthStateChanged(auth, callback);
    }
    // No-op unsubscribe for mock
    return () => {};
  }
}
