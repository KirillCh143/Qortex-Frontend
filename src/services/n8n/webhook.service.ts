import { ChatQueryPayloadSchema, WebhookResponseSchema, type ChatQueryPayload, type WebhookResponse } from './types'

export interface WebhookService {
  sendQuery: (payload: ChatQueryPayload) => Promise<WebhookResponse>
}

export const createWebhookService = (webhookUrl: string): WebhookService => ({
  sendQuery: async (payload: ChatQueryPayload): Promise<WebhookResponse> => {
    // Validate outgoing payload
    const validatedPayload = ChatQueryPayloadSchema.parse(payload)

    // Create AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 95000) // 95 seconds, just under n8n's 100s limit

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Validate incoming response
      return WebhookResponseSchema.parse(data)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - the query is taking too long. Please try a simpler question.')
        }
      }
      throw error
    }
  }
})
