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

      // Check if SDK has stored tokens (it stores in localStorage with key: directus-data)
      const storedData = localStorage.getItem('directus-data');
      if (!storedData) {
        if (import.meta.env.DEV) {
          console.debug('[auth] No stored session found');
        }
        setUser(null);
        setLoading(false);
        return;
      }

      // SDK has tokens stored, try to use them
      // The SDK will automatically refresh if access_token is expired
      const currentUser = await client.request(readMe());
      setUser(currentUser as User);

      if (import.meta.env.DEV) {
        console.debug('[auth] Session restored from localStorage, user:', currentUser.email);
      }
    } catch (error) {
      // Token invalid or expired and refresh failed
      setUser(null);
      if (import.meta.env.DEV) {
        console.error('[auth] Session restore failed:', error);
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
        console.debug('[auth] Login successful, checking storage...');
        console.debug('[auth] directus-data:', localStorage.getItem('directus-data') ? 'present' : 'missing');
      }

      // Give SDK a moment to store tokens, then fetch user
      await new Promise(resolve => setTimeout(resolve, 100));
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
