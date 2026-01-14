import { createWebhookService } from '@/services/n8n/webhook.service'
import { createMockWebhookService } from '@/services/mock/webhook.mock'
import { createMockFilesService } from '@/services/mock/files.mock'
import { createRealFilesService } from '@/services/directus/files.service'
import directusClient from '@/lib/directus'
import { loadSettings } from './settings'

// Determine if mock data should be used based on environment variable
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Create webhook service based on mock/real toggle
export const createWebhookServiceInstance = () => {
  if (useMockData) {
    return createMockWebhookService()
  }

  // Load webhook URL from user settings
  const settings = loadSettings()
  return createWebhookService(settings.n8nWebhookUrl)
}

// Create files service based on mock/real toggle
export const createFilesServiceInstance = () => {
  if (useMockData) {
    return createMockFilesService()
  }

  return createRealFilesService(directusClient)
}

// Export singleton instances
export const webhookService = createWebhookServiceInstance()
export const filesService = createFilesServiceInstance()
