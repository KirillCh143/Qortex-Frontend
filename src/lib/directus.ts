import { createDirectus, rest, authentication } from '@directus/sdk';

const BACKEND_URL = 'http://localhost:8055';

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
