import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { AuthService } from '../services/firebase/authService';
import { mockStudentUser, mockTeacherUser } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to mockStudentUser for smooth initial testing
  const [user, setUser] = useState<User | null>(mockStudentUser);
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const login = async (email: string, pass: string, chosenRole: UserRole = 'student') => {
    setIsLoading(true);
    try {
      const loggedUser = await AuthService.login(email, pass, chosenRole);
      setUser(loggedUser);
      setRole(loggedUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'teacher') {
      setUser(mockTeacherUser);
    } else {
      setUser(mockStudentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        switchRole,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
