import { createWebhookService } from '@/services/n8n/webhook.service'
import { createMockWebhookService } from '@/services/mock/webhook.mock'
import { createMockFilesService, createMockFoldersService } from '@/services/mock/files.mock'
import { createRealFilesService, createRealFoldersService } from '@/services/directus/files.service'
import { createMockChatService } from '@/services/mock/chat.mock'
import { createRealChatService } from '@/services/directus/chat.service'
import { createMockPortainerService } from '@/services/mock/portainer.mock'
import { createRealPortainerService } from '@/services/portainer/portainer.service'
import directusClient from '@/lib/directus'

// Determine if mock data should be used based on environment variable
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Create webhook service based on mock/real toggle
export const createWebhookServiceInstance = () => {
  if (useMockData) {
    return createMockWebhookService()
  }

  // Load webhook URL from environment variable
  const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string || 'http://localhost:8081/webhook/chat'
  return createWebhookService(n8nWebhookUrl)
}

// Create files service based on mock/real toggle
export const createFilesServiceInstance = () => {
  if (useMockData) {
    return createMockFilesService()
  }

  return createRealFilesService(directusClient)
}

// Create folders service based on mock/real toggle
export const createFoldersServiceInstance = () => {
  if (useMockData) {
    return createMockFoldersService()
  }

  return createRealFoldersService(directusClient)
}

// Create chat service based on mock/real toggle
export const createChatServiceInstance = () => {
  if (useMockData) {
    return createMockChatService()
  }

  return createRealChatService(directusClient)
}

// Create portainer service based on mock/real toggle
export const createPortainerServiceInstance = () => {
  if (useMockData) {
    return createMockPortainerService()
  }

  return createRealPortainerService()
}

// Export singleton instances
export const webhookService = createWebhookServiceInstance()
export const filesService = createFilesServiceInstance()
export const foldersService = createFoldersServiceInstance()
export const chatService = createChatServiceInstance()
export const portainerService = createPortainerServiceInstance()
