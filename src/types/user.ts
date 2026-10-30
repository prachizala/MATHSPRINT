export type UserRole = 'student' | 'teacher';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  avatarUrl?: string;
  createdAt: number;
  totalSprintsPlayed?: number;
  averageAccuracy?: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}
