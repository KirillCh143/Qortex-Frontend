export interface ApiSettings {
  messagePersistence: boolean
}

const STORAGE_KEY = 'api-settings'

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
        messagePersistence: true
      }
    }

    const parsed = JSON.parse(stored)

    // Return parsed settings with fallback to defaults for missing values
    return {
      messagePersistence: parsed.messagePersistence !== undefined ? parsed.messagePersistence : true
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
    return {
      messagePersistence: true
    }
  }
}
