import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import client from '../lib/directus';
import { readMe, logout as directusLogout } from '@directus/sdk';

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

      const authData = localStorage.getItem('directus_auth');
      if (!authData) {
        setLoading(false);
        return;
      }

      // Validate stored token by calling readMe()
      const currentUser = await client.request(readMe());
      setUser(currentUser as User);
    } catch (error) {
      // Token invalid or expired - clear storage
      localStorage.removeItem('directus_auth');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Use client.login() for JSON auth mode - SDK handles token storage
    const result = await client.login({ email, password });
    localStorage.setItem('directus_auth', JSON.stringify(result));
    await checkAuth();
  };

  const logout = async () => {
    try {
      const authData = localStorage.getItem('directus_auth');
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        // Call logout with refresh_token and consistent JSON mode
        await client.request(
          directusLogout({ refresh_token: parsedAuth.refresh_token, mode: 'json' })
        );
      }
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout error:', error);
    } finally {
      // Always clear localStorage and user state
      localStorage.removeItem('directus_auth');
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
