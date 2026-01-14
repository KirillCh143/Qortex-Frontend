export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mode?: 'rag' | 'llm'
}

const STORAGE_KEY = 'chat-messages'

/**
 * Save messages to localStorage with proper date serialization
 */
export function saveMessages(messages: Message[]): void {
  try {
    const serialized = JSON.stringify(messages, (key, value) => {
      // Convert Date objects to ISO strings for storage
      if (key === 'timestamp' && value instanceof Date) {
        return value.toISOString()
      }
      return value
    })
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error)
  }
}

/**
 * Load messages from localStorage with proper date deserialization
 */
export function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    // Deserialize timestamp strings back to Date objects
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error)
    return []
  }
}
