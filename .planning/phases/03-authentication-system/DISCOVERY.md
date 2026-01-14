# Directus Authentication Integration - Discovery Document

**Date:** 2026-01-14
**Context:** React + TypeScript application with Directus backend (localhost:8055)
**Goal:** Implement secure authentication with custom login page and protected routes

---

## 1. Overview

Directus provides a comprehensive authentication system with built-in SDK support for React applications. The authentication flow uses access tokens (short-lived) paired with refresh tokens (long-lived) to maintain secure sessions.

**Key Principle:** "All data within the platform is private by default." - Users must authenticate to access private data unless the public role is explicitly configured.

---

## 2. Authentication Flow

### Standard Authentication Pattern

1. **User Login** → Directus validates credentials and returns tokens
2. **Store Tokens** → Application stores access_token and refresh_token (localStorage or cookies)
3. **Authenticate Requests** → Include access_token in API requests
4. **Token Expiration** → When access_token expires, use refresh_token to get new tokens
5. **Logout** → Invalidate refresh_token and clear stored credentials

### Two Authentication Modes

Directus supports two distinct authentication modes:

| Mode | Storage | Security | Use Case |
|------|---------|----------|----------|
| **JSON** | Developer manages (localStorage) | Developer responsible for XSS protection | SPAs with manual token management |
| **Cookie (Session)** | httpOnly cookies (automatic) | Browser-protected, not accessible via JavaScript | Browser applications (recommended for better security) |

**Recommendation for this project:** Use **JSON mode** as specified in requirements (localStorage-based session management).

---

## 3. Directus SDK Setup

### Installation

```bash
npm install @directus/sdk
```

### Client Configuration

```typescript
// src/lib/directus.ts
import { createDirectus, rest, authentication } from '@directus/sdk';

const BACKEND_URL = 'http://localhost:8055';

const client = createDirectus(BACKEND_URL)
  .with(authentication('json'))  // JSON mode for localStorage-based auth
  .with(rest());

export default client;
```

**Important:** The `authentication()` composable provides:
- `login()` method for authentication
- `logout()` method for session termination
- `refresh()` method for token renewal
- **Automatic token storage and refresh management**

---

## 4. API Endpoints & Payload Structures

### 4.1 Login

**Endpoint:** `POST /auth/login`

**Request Payload:**
```typescript
{
  email: string;        // User's email address
  password: string;     // User's password
  mode?: 'json' | 'cookie' | 'session';  // Authentication mode
  otp?: string;         // One-time password (if MFA enabled)
}
```

**Success Response (200 OK):**
```typescript
{
  access_token: string;   // JWT token for API requests
  expires: number;        // Token expiration time in milliseconds
  refresh_token: string;  // Token for refreshing access_token
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User doesn't exist

**SDK Implementation:**
```typescript
// Login function
const login = async (email: string, password: string) => {
  try {
    const result = await client.login({ email, password });
    // Store in localStorage
    localStorage.setItem('directus_auth', JSON.stringify(result));
    return result;
  } catch (error) {
    // Handle 401/404 errors
    throw error;
  }
};
```

### 4.2 Logout

**Endpoint:** `POST /auth/logout`

**Request Payload:**
```typescript
{
  refresh_token: string;  // Token to invalidate
  mode?: 'json' | 'cookie' | 'session';  // Must match login mode
}
```

**Success Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid refresh token
- `404 Not Found` - Token doesn't exist

**SDK Implementation:**
```typescript
import { logout } from '@directus/sdk';

const logoutUser = async () => {
  const authData = JSON.parse(localStorage.getItem('directus_auth') || '{}');
  const refresh_token = authData.refresh_token;

  await client.request(logout({ refresh_token, mode: 'json' }));
  localStorage.removeItem('directus_auth');
};
```

### 4.3 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request Payload:**
```typescript
{
  refresh_token: string;  // Valid refresh token
  mode?: 'json' | 'cookie' | 'session';  // Must match original auth mode
}
```

**Success Response (200 OK):**
```typescript
{
  access_token: string;      // New JWT token
  expires: number;           // Expiration time
  refresh_token: string;     // New refresh token
}
```

**Error Response:** `401 Unauthorized` - Invalid or expired refresh token

**SDK Implementation:**
```typescript
const refreshToken = async () => {
  try {
    const result = await client.refresh();
    localStorage.setItem('directus_auth', JSON.stringify(result));
    return result;
  } catch (error) {
    // If refresh fails, user must re-login
    localStorage.removeItem('directus_auth');
    throw error;
  }
};
```

### 4.4 Get Current User

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```typescript
{
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  // ... other user fields
}
```

**SDK Implementation:**
```typescript
import { readMe } from '@directus/sdk';

const getCurrentUser = async () => {
  return await client.request(readMe());
};
```

---

## 5. Token Management Patterns

### 5.1 Token Storage Strategy

**localStorage Structure:**
```typescript
interface DirectusAuth {
  access_token: string;
  refresh_token: string;
  expires: number;        // Timestamp in milliseconds
  expires_at?: number;    // Calculated expiration date
}

// Store tokens
localStorage.setItem('directus_auth', JSON.stringify(authData));

// Retrieve tokens
const authData: DirectusAuth = JSON.parse(
  localStorage.getItem('directus_auth') || '{}'
);
```

### 5.2 Token Expiration Detection

```typescript
const isTokenExpired = (authData: DirectusAuth): boolean => {
  if (!authData.expires) return true;

  const expirationTime = Date.now() + authData.expires;
  const buffer = 60000; // 1 minute buffer before expiration

  return Date.now() >= (expirationTime - buffer);
};
```

### 5.3 Automatic Token Refresh

**Pattern 1: Check Before Each Request**
```typescript
const makeAuthenticatedRequest = async () => {
  const authData = JSON.parse(localStorage.getItem('directus_auth') || '{}');

  if (isTokenExpired(authData)) {
    await refreshToken();
  }

  // Proceed with request
  return await client.request(/* your request */);
};
```

**Pattern 2: Axios/Fetch Interceptor** (Recommended)
```typescript
// Add request interceptor to automatically refresh tokens
axios.interceptors.request.use(
  async (config) => {
    const authData = JSON.parse(localStorage.getItem('directus_auth') || '{}');

    if (isTokenExpired(authData)) {
      await refreshToken();
      const newAuthData = JSON.parse(localStorage.getItem('directus_auth') || '{}');
      config.headers.Authorization = `Bearer ${newAuthData.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

**Pattern 3: SDK Built-in Refresh** (Easiest)
The Directus SDK with `authentication()` composable handles token refresh automatically. You just need to ensure tokens are properly stored in the expected format.

### 5.4 Token Types Comparison

| Token Type | Lifespan | Purpose | Storage |
|------------|----------|---------|---------|
| **Access Token** | Short (15 min default) | API authentication | Memory or localStorage |
| **Refresh Token** | Long (7-30 days) | Renew access tokens | localStorage (secure) |
| **Static Token** | Never expires | Server/admin access | Database (generated in Directus admin) |

**Security Note:** "Make sure to backup and copy the token above. For security reasons, you will not be able to view the token again after saving." - This applies to static tokens generated in Directus admin panel.

---

## 6. React Implementation Architecture

### 6.1 Authentication Context Provider

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      const authData = localStorage.getItem('directus_auth');
      if (!authData) {
        setLoading(false);
        return;
      }

      const currentUser = await client.request(readMe());
      setUser(currentUser);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('directus_auth');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await client.login({ email, password });
    localStorage.setItem('directus_auth', JSON.stringify(result));
    await checkAuth();
  };

  const logout = async () => {
    const authData = JSON.parse(localStorage.getItem('directus_auth') || '{}');
    await client.request(logout({ refresh_token: authData.refresh_token, mode: 'json' }));
    localStorage.removeItem('directus_auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
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
```

### 6.2 Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

### 6.3 Login Page Implementation

```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect after successful login
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit">Login</button>
    </form>
  );
};
```

### 6.4 Router Configuration

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* Add more protected routes */}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 7. Error Handling Recommendations

### 7.1 Common Error Codes

| Status Code | Meaning | Recommended Action |
|-------------|---------|-------------------|
| `401 Unauthorized` | Invalid credentials or expired token | Prompt re-login |
| `403 Forbidden` | Valid auth but insufficient permissions | Show access denied message |
| `404 Not Found` | User/resource doesn't exist | Show error, redirect to login |
| `422 Unprocessable Entity` | Validation error (e.g., weak password) | Display validation errors |

**Critical Note:** "The API returns 403 status codes for both missing resources and permission issues." You need to distinguish between authentication failures and missing data scenarios in your error handling logic.

### 7.2 Error Handling Patterns

```typescript
// Centralized error handler
const handleAuthError = (error: any, navigate: (path: string) => void) => {
  if (error.response?.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('directus_auth');
    navigate('/login');
  } else if (error.response?.status === 403) {
    // Permission denied - could be auth or permissions
    // Check if user is authenticated first
    const authData = localStorage.getItem('directus_auth');
    if (!authData) {
      navigate('/login');
    } else {
      // Show permission denied message
      console.error('Access denied: Insufficient permissions');
    }
  } else if (error.response?.status === 404) {
    // Resource not found
    console.error('Resource not found');
  }
};
```

### 7.3 Refresh Token Failure Handling

```typescript
// When refresh token fails, clear everything and redirect
const handleRefreshFailure = () => {
  localStorage.removeItem('directus_auth');
  // Clear any other cached user data
  // Redirect to login
  window.location.href = '/login';
};
```

---

## 8. CORS Configuration

### 8.1 Development Setup

For local development with Directus on `localhost:8055` and React on different port:

**Directus `.env` configuration:**
```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true
```

**Important:** The wildcard `'*'` cannot be used for `Access-Control-Allow-Origin` when credentials mode is `'include'`. You must specify exact origins.

### 8.2 Common CORS Issues & Solutions

**Issue 1: Preflight Requests Failing**
- **Cause:** Missing `Access-Control-Allow-Origin` header in preflight response
- **Solution:** Ensure `CORS_ENABLED=true` and origin is in `CORS_ORIGIN` list

**Issue 2: PATCH/PUT Methods Blocked**
- **Cause:** Method not allowed in `Access-Control-Allow-Methods`
- **Solution:** Directus should handle this automatically; verify Directus version is up-to-date

**Issue 3: Credentials Not Included**
- **Cause:** Fetch/Axios not configured to include credentials
- **Solution:** The Directus SDK handles this automatically when using `authentication()` composable

### 8.3 Production Configuration

```env
# Only allow your production domain
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# For cookie-based auth (if switching from JSON mode)
REFRESH_TOKEN_COOKIE_DOMAIN=.yourdomain.com
REFRESH_TOKEN_COOKIE_SECURE=true
REFRESH_TOKEN_COOKIE_SAME_SITE=None
```

---

## 9. Security Best Practices

### 9.1 Token Storage Security

**localStorage Risks:**
- Vulnerable to XSS attacks (malicious scripts can access tokens)
- Tokens persist across browser sessions

**Mitigation Strategies:**
1. **Content Security Policy (CSP):** Prevent script injection
2. **Sanitize User Input:** Prevent XSS vectors
3. **Token Expiration:** Keep access token lifetime short (15 min)
4. **HTTPS Only:** Never use HTTP in production

**Alternative (More Secure):** Session cookies with `httpOnly` flag (prevents JavaScript access)

### 9.2 Registration Security

**Enable Public Registration:**
Directus requires explicit configuration to allow self-registration:

```env
PUBLIC_REGISTRATION=true
```

Without this setting, registration endpoints will fail even if implemented in frontend.

### 9.3 Password Security

**Client-Side Validation:**
```typescript
const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  return errors;
};
```

**Server-Side:** Directus handles password hashing and validation automatically.

---

## 10. Common Pitfalls & Gotchas

### 10.1 Token Not Refreshing Automatically

**Issue:** Tokens expire mid-session, causing 401 errors

**Solution:** The Directus SDK with `authentication()` handles refresh automatically IF tokens are stored correctly. Ensure you're using the SDK methods (`client.login()`, `client.refresh()`) rather than manual fetch calls.

### 10.2 localStorage Tokens Persisting After Expiration

**Issue:** Expired tokens remain in localStorage

**Solution:** Always validate tokens on app initialization and remove invalid tokens:

```typescript
useEffect(() => {
  const validateStoredAuth = async () => {
    try {
      const authData = localStorage.getItem('directus_auth');
      if (authData) {
        await client.request(readMe()); // Validates token
      }
    } catch {
      localStorage.removeItem('directus_auth');
    }
  };

  validateStoredAuth();
}, []);
```

### 10.3 Multiple Refresh Token Requests

**Issue:** Concurrent API calls all trigger token refresh, causing multiple refresh requests

**Solution:** Implement a refresh lock mechanism:

```typescript
let refreshPromise: Promise<any> | null = null;

const refreshTokenWithLock = async () => {
  if (refreshPromise) {
    return refreshPromise; // Return existing promise
  }

  refreshPromise = client.refresh()
    .then(result => {
      localStorage.setItem('directus_auth', JSON.stringify(result));
      return result;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
```

### 10.4 Cookie vs JSON Mode Confusion

**Issue:** Mixing authentication modes (e.g., login with 'json', logout with 'cookie')

**Solution:** Always use consistent mode parameter:

```typescript
const AUTH_MODE = 'json'; // Define once, use everywhere

await client.login({ email, password, mode: AUTH_MODE });
await client.request(logout({ refresh_token, mode: AUTH_MODE }));
await client.refresh({ mode: AUTH_MODE });
```

### 10.5 Race Condition on Page Load

**Issue:** Protected route checks authentication before tokens are loaded from localStorage

**Solution:** Use loading state in AuthContext:

```typescript
const { isAuthenticated, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
```

---

## 11. Recommended Libraries & Tools

### 11.1 Essential Dependencies

```json
{
  "dependencies": {
    "@directus/sdk": "^latest",
    "react-router-dom": "^6.x",
    "axios": "^1.x" // Optional: for custom API calls
  }
}
```

**Note:** Don't hand-roll authentication logic. The Directus SDK provides battle-tested implementations for:
- Token storage and retrieval
- Automatic token refresh
- Request authentication
- Error handling

### 11.2 Optional Enhancements

**Form Validation:**
```bash
npm install react-hook-form zod
```

**State Management (for complex apps):**
```bash
npm install zustand
# or
npm install @tanstack/react-query
```

**Toast Notifications:**
```bash
npm install react-hot-toast
```

---

## 12. Testing Considerations

### 12.1 Mock Authentication for Tests

```typescript
// __mocks__/directus.ts
export const mockDirectusClient = {
  login: jest.fn(),
  logout: jest.fn(),
  refresh: jest.fn(),
  request: jest.fn(),
};
```

### 12.2 Test Protected Routes

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

test('redirects to login when not authenticated', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <ProtectedRoute />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
```

---

## 13. Additional Resources & Password Reset Flow

### 13.1 Password Reset Implementation

**Request Reset:**
```typescript
// POST /auth/password/request
const requestPasswordReset = async (email: string) => {
  await client.request(
    passwordRequest(email, 'http://localhost:5173/reset-password')
  );
};
```

**Reset Password:**
```typescript
// POST /auth/password/reset
const resetPassword = async (token: string, password: string) => {
  await client.request(passwordReset(token, password));
};
```

**Environment Configuration:**
```env
# Directus .env
PASSWORD_RESET_URL_ALLOW_LIST=http://localhost:5173/reset-password,https://yourdomain.com/reset-password
```

### 13.2 OAuth Integration

Directus supports OAuth providers (GitHub, Google, Facebook, etc.):

```typescript
// List available providers
const providers = await client.request(readAuthProviders());

// OAuth flow
window.location.href = `http://localhost:8055/auth/oauth/github?redirect=http://localhost:5173/auth/callback`;
```

---

## 14. Implementation Checklist

- [ ] Install `@directus/sdk` and `react-router-dom`
- [ ] Configure Directus client with `authentication('json')` and `rest()`
- [ ] Set up CORS in Directus `.env` for localhost development
- [ ] Create `AuthContext` with user state, login, logout, and loading
- [ ] Implement `ProtectedRoute` component with loading state check
- [ ] Build custom login page with email/password form
- [ ] Add error handling for 401, 403, 404 status codes
- [ ] Implement token validation on app initialization
- [ ] Test token refresh flow (automatic via SDK)
- [ ] Add logout functionality that clears localStorage
- [ ] Configure protected routes in React Router
- [ ] Test authentication flow end-to-end
- [ ] Add password validation on registration (if implementing)
- [ ] Implement loading states for better UX
- [ ] Add error messages/toast notifications

---

## 15. Sources & Further Reading

**Official Documentation:**
- [Using Authentication in React | Directus Docs](https://directus.io/docs/tutorials/getting-started/using-authentication-in-react)
- [Authentication API | Directus Docs](https://directus.io/docs/api/authentication)
- [Directus SDK Guide](https://directus.io/docs/guides/connect/sdk)
- [Tokens & Cookies | Directus Docs](https://directus.io/docs/guides/auth/tokens-cookies)

**Community Resources:**
- [Directus SDK Authentication](https://docs.directus.io/guides/sdk/authentication)
- [SDK - Handling Access and Refresh Tokens | Directus Community](https://community.directus.io/t/sdk-handling-access-and-refresh-tokens-from-server-side/1329)
- [Directus CORS Error Solutions](https://www.restack.io/docs/directus-knowledge-directus-cors-error-fix)

**React Authentication Patterns:**
- [Protected Routes in React Router](https://react.wiki/router/protected-routes/)
- [Authentication with React Router v6 | LogRocket Blog](https://blog.logrocket.com/authentication-react-router-v6/)

---

## 16. Next Steps

1. **Review existing project structure** - Check if React Router is already set up
2. **Install dependencies** - Add Directus SDK and any missing packages
3. **Configure Directus CORS** - Update `.env` file in Directus Docker container
4. **Implement AuthContext** - Create centralized authentication state management
5. **Build Login Page** - Custom UI as specified in requirements
6. **Set up Protected Routes** - Wrap authenticated routes with ProtectedRoute component
7. **Test Authentication Flow** - Verify login, logout, token refresh, and protected route access
8. **Error Handling** - Add user-friendly error messages and validation

**Priority:** Start with SDK setup and AuthContext before building UI components. This ensures the authentication infrastructure is solid before layering on interface elements.
