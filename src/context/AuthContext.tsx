import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';

export const AUTHORIZED_EMAIL = 'mohdshayau46@gmail.com';
export const AUTHORIZED_PASSWORD = 'mohd123';

const AUTH_STORAGE_KEY = 'al_millah_auth_session_v1';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  quickDemoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      // Clear any previous persisted session so the authentication page is shown directly
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing session', e);
    }
    return null;
  });

  const isAuthenticated = !!user;

  const login = (email: string, pass: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { 
        success: false, 
        error: 'Please provide both email address and password.' 
      };
    }

    if (cleanEmail === AUTHORIZED_EMAIL.toLowerCase() && cleanPass === AUTHORIZED_PASSWORD) {
      const authenticatedUser: AuthUser = {
        email: AUTHORIZED_EMAIL,
        name: 'Ustadh Mohd Shayau',
        arabicName: 'الشيخ أ. محمد شايعو',
        role: 'head_teacher',
        title: 'Class Five Supervisor & Qur’an Teacher',
        loginTime: new Date().toISOString()
      };

      setUser(authenticatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } catch (e) {
        console.error('Failed to save session', e);
      }
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Invalid credentials. Only the authorized teacher account can access this portal.' 
    };
  };

  const quickDemoLogin = () => {
    login(AUTHORIZED_EMAIL, AUTHORIZED_PASSWORD);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        quickDemoLogin,
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
