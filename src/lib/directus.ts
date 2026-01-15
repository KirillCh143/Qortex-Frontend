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
      // Directus URL precedence: user settings > env var > dev/prod defaults
      // 1. User settings from localStorage (highest priority)
      // 2. VITE_DIRECTUS_URL environment variable
      // 3. Dev mode: window.location.origin (for Vite proxy)
      // 4. Production: http://localhost:8055 (fallback)
      const DEV = import.meta.env.DEV as boolean;
      const userSettings = loadSettings();
      const BACKEND_URL = userSettings.directusUrl ||
        ((import.meta.env.VITE_DIRECTUS_URL as string) ??
        (DEV ? window.location.origin : 'http://localhost:8055'));

      // Debug: show which base URL the Directus client will use (helps troubleshoot CORS/proxy)
      if (DEV) {
        // eslint-disable-next-line no-console
        console.debug('[directus] BACKEND_URL =', BACKEND_URL);
      }

      return createDirectus<DirectusSchema>(BACKEND_URL)
        .with(authentication('json'))
        .with(rest());
    })();

export default client!;
