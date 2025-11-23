import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { authService } from '@/services/auth.service';
import type { UserProfile, LoginCredentials } from '@/services/auth.service';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    // Check if user is already logged in
    const storedUser = authService.getStoredUser();
    const token = authService.getStoredToken();

    if (storedUser && token) {
      setUser(storedUser);
      // Verify token is still valid by fetching profile
      authService
        .getProfile(controller.signal)
        .then((profile) => {
          if (controller.signal.aborted) return;
          setUser(profile);
          authService.storeAuth(token, profile);
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
          // Token invalid, clear auth
          authService.clearAuth();
          setUser(null);
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    authService.storeAuth(response.token, response.user);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      const token = authService.getStoredToken();
      if (token) {
        authService.storeAuth(token, profile);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      authService.clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

