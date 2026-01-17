import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import client from '../lib/directus';
import { readMe } from '@directus/sdk';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Skip real auth check if using mock data
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      if (useMockData) {
        setLoading(false);
        return;
      }

      // Let SDK handle token restoration and auto-refresh completely
      // SDK will:
      // 1. Check its internal storage for tokens
      // 2. Auto-refresh expired access_token using refresh_token
      // 3. Throw error if no valid session exists
      if (import.meta.env.DEV) {
        console.debug('[auth] Checking session (SDK will auto-restore/refresh if needed)');
      }

      const currentUser = await client.request(readMe());
      setUser(currentUser as User);

      if (import.meta.env.DEV) {
        console.debug('[auth] Session valid, user:', currentUser.email);
      }
    } catch (error) {
      // No valid session (no tokens, or refresh failed)
      setUser(null);
      if (import.meta.env.DEV) {
        console.debug('[auth] No valid session found');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // SDK handles token storage automatically
      await client.login({ email, password });

      if (import.meta.env.DEV) {
        console.debug('[auth] Login successful, SDK stored tokens automatically');
      }

      // Fetch user info now that we're authenticated
      await checkAuth();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[auth] Login failed:', error);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      // SDK handles token cleanup automatically
      await client.logout();
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout error:', error);
    } finally {
      // SDK already cleared tokens, just clear user state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
