import { createDirectus, rest, authentication } from '@directus/sdk';
import { loadSettings } from './settings';

// TypeScript interface for DirectusAuth structure
export interface DirectusAuth {
  access_token: string;
  refresh_token: string;
  expires: number;
}

// Schema for custom collections
interface ChatMessageItem {
  id: string;
  user: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: 'rag' | 'llm';
  timestamp: string;
  date_created: string;
}

interface DirectusSchema {
  chat_messages: ChatMessageItem;
}

// Check if we're in mock mode - if so, skip Directus initialization to prevent CORS errors
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Create Directus client configured for JSON auth mode (localStorage-based)
// Only initialize if NOT in mock mode to prevent SDK auto-refresh attempts
const client = useMockData
  ? null
  : (() => {
      // Directus URL precedence:
      // DEV mode: VITE_DIRECTUS_URL env var > user settings > fallback
      // PROD mode: user settings > VITE_DIRECTUS_URL > fallback
      const DEV = import.meta.env.DEV as boolean;
      const userSettings = loadSettings();
      const envUrl = import.meta.env.VITE_DIRECTUS_URL as string;

      let BACKEND_URL: string;
      if (DEV) {
        // In development: env var takes priority (for .env configuration)
        BACKEND_URL = envUrl || userSettings.directusUrl || 'http://localhost:8080';
      } else {
        // In production: user settings take priority
        BACKEND_URL = userSettings.directusUrl || envUrl || 'http://localhost:8055';
      }

      // Debug: show which base URL the Directus client will use (helps troubleshoot CORS/proxy)
      if (DEV) {
        // eslint-disable-next-line no-console
        console.debug('[directus] BACKEND_URL =', BACKEND_URL);
      }

      return createDirectus<DirectusSchema>(BACKEND_URL)
        .with(authentication('json', {
          storage: {
            get: () => {
              const data = localStorage.getItem('directus-auth');
              return data ? JSON.parse(data) : null;
            },
            set: (value) => {
              if (value === null) {
                localStorage.removeItem('directus-auth');
              } else {
                localStorage.setItem('directus-auth', JSON.stringify(value));
              }
            },
          },
        }))
        .with(rest());
    })();

export default client!;
