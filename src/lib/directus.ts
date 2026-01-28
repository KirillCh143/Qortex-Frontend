import { createDirectus, rest, authentication } from '@directus/sdk';

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
      // Directus URL from environment variable with fallback
      const envUrl = import.meta.env.VITE_DIRECTUS_URL as string;
      const BACKEND_URL = envUrl || 'http://localhost:8080';

      // Debug: show which base URL the Directus client will use (helps troubleshoot CORS/proxy)
      if (import.meta.env.DEV) {
         
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
