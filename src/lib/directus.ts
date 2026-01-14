import { createDirectus, rest, authentication } from '@directus/sdk';
import { loadSettings } from './settings';

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

// TypeScript interface for DirectusAuth structure
export interface DirectusAuth {
  access_token: string;
  refresh_token: string;
  expires: number;
}

// Create Directus client configured for JSON auth mode (localStorage-based)
const client = createDirectus(BACKEND_URL)
  .with(authentication('json'))
  .with(rest());

export default client;
