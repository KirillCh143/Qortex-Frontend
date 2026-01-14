export interface ApiSettings {
  directusUrl: string
  n8nWebhookUrl: string
  messagePersistence: boolean
}

const STORAGE_KEY = 'api-settings'

// Default values for API endpoints
// Precedence: user settings > env var > dev/prod defaults
const DEV = import.meta.env.DEV as boolean
const DEFAULT_DIRECTUS_URL = DEV ? window.location.origin : 'http://localhost:8055'
const DEFAULT_N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/chat'

/**
 * Save API settings to localStorage
 */
export function saveSettings(settings: ApiSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

/**
 * Load API settings from localStorage with proper defaults
 */
export function loadSettings(): ApiSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {
        directusUrl: DEFAULT_DIRECTUS_URL,
        n8nWebhookUrl: DEFAULT_N8N_WEBHOOK_URL,
        messagePersistence: true
      }
    }

    const parsed = JSON.parse(stored)

    // Return parsed settings with fallback to defaults for missing values
    return {
      directusUrl: parsed.directusUrl || DEFAULT_DIRECTUS_URL,
      n8nWebhookUrl: parsed.n8nWebhookUrl || DEFAULT_N8N_WEBHOOK_URL,
      messagePersistence: parsed.messagePersistence !== undefined ? parsed.messagePersistence : true
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
    return {
      directusUrl: DEFAULT_DIRECTUS_URL,
      n8nWebhookUrl: DEFAULT_N8N_WEBHOOK_URL,
      messagePersistence: true
    }
  }
}
