import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import client from '../lib/directus';
import { readMe } from '@directus/sdk';

/**
 * Authentication Context - SDK-Managed Auth Flow
 *
 * This context manages user authentication using the Directus SDK with fully
 * SDK-managed token lifecycle (storage, restoration, and automatic refresh).
 *
 * ## How SDK Authentication Works
 *
 * The Directus SDK is configured with `authentication('json')` mode which:
 * 1. Uses token-based authentication (not cookies)
 * 2. Stores tokens in localStorage using custom storage handlers
 * 3. Automatically restores tokens on page load
 * 4. Automatically refreshes expired access_token using refresh_token
 *
 * ## Storage Configuration (src/lib/directus.ts)
 *
 * Custom storage handlers ensure proper token persistence:
 * - Storage key: 'directus-auth'
 * - Storage format: JSON object with { access_token, refresh_token, expires }
 * - get(): Reads and deserializes from localStorage
 * - set(): Serializes and writes to localStorage (or removes if null)
 *
 * ## Authentication Lifecycle
 *
 * ### Initial Page Load (No Session)
 * 1. checkAuth() runs on mount
 * 2. SDK checks localStorage - finds nothing
 * 3. request(readMe()) fails with 401 (expected)
 * 4. We catch error, set user=null, show login page
 *
 * ### Login Flow
 * 1. User submits credentials
 * 2. client.login() sends credentials to Directus
 * 3. Server returns access_token + refresh_token
 * 4. SDK calls storage.set() to save tokens to localStorage
 * 5. checkAuth() fetches user info with stored tokens
 * 6. User state updates, app shows authenticated UI
 *
 * ### Page Refresh (With Session)
 * 1. checkAuth() runs on mount
 * 2. SDK calls storage.get() to restore tokens from localStorage
 * 3. SDK checks if access_token is expired
 * 4. If expired: SDK auto-refreshes using refresh_token before request
 * 5. request(readMe()) succeeds with valid/refreshed token
 * 6. User state restored, stays logged in
 *
 * ### Logout Flow
 * 1. client.logout() calls Directus logout endpoint
 * 2. SDK calls storage.set(null) to clear tokens from localStorage
 * 3. User state cleared, redirects to login
 *
 * ## Token Refresh (Automatic)
 *
 * The SDK handles token refresh transparently:
 * - Before each request, SDK checks if access_token is expired
 * - If expired: SDK automatically calls /auth/refresh with refresh_token
 * - New access_token saved via storage.set()
 * - Original request proceeds with fresh token
 * - No manual intervention needed
 *
 * ## nginx Proxy Configuration
 *
 * Backend access through nginx at http://localhost:8080 (port 80 in container):
 * - Proxies to Directus at http://directus:8055
 * - CORS headers: Access-Control-Allow-Origin: http://localhost:5173
 * - Credentials: Access-Control-Allow-Credentials: true
 * - Headers exposed for pagination: Content-Length, Content-Range
 *
 * ## Token Duration (Configured in Directus)
 *
 * Set in Phase 7.1:
 * - Access token: 7 days (internal tool, low security risk)
 * - Refresh token: 30 days
 * - Auto-refresh extends session transparently
 *
 * ## Mock Mode Bypass
 *
 * When VITE_USE_MOCK_DATA=true:
 * - All auth checks skipped (no Directus calls)
 * - Mock data services handle data without authentication
 * - Prevents CORS errors during development without backend
 *
 * ## Why We Don't Manually Manage localStorage
 *
 * Previous approach had manual localStorage.setItem('directus_auth', ...) which:
 * ❌ Conflicted with SDK's internal storage format
 * ❌ Prevented SDK auto-refresh from working
 * ❌ Caused 401 errors on page refresh
 *
 * Current approach lets SDK own the entire auth lifecycle:
 * ✅ Consistent storage format across page loads
 * ✅ Auto-refresh works seamlessly
 * ✅ Session persists across browser restarts
 * ✅ No manual storage conflicts
 *
 * ## Debug Logging
 *
 * In development (DEV mode), console.debug shows:
 * - Session restore attempts
 * - Login success/failure
 * - Token refresh activity (via SDK internal logging if enabled)
 *
 * This helps troubleshoot auth issues during development.
 */

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
