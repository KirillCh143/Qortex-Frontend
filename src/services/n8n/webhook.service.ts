import { ChatQueryPayloadSchema, WebhookResponseSchema, type ChatQueryPayload, type WebhookResponse } from './types'

export interface WebhookService {
  sendQuery: (payload: ChatQueryPayload, onChunk?: (text: string) => void) => Promise<WebhookResponse>
}

export const createWebhookService = (webhookUrl: string): WebhookService => ({
  sendQuery: async (payload: ChatQueryPayload, onChunk?: (text: string) => void): Promise<WebhookResponse> => {
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

      // Check if response is streaming (n8n with enableStreaming: true)
      const contentType = response.headers.get('Content-Type') || ''
      const isStreaming = response.body && onChunk

      if (isStreaming) {
        // Handle streaming response from n8n AI Agent
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedAnswer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) break

            const chunk = decoder.decode(value, { stream: true })

            // n8n AI Agent streams plain text chunks (not SSE format)
            // Just accumulate and send each chunk
            if (chunk.trim()) {
              accumulatedAnswer += chunk
              onChunk(accumulatedAnswer)
            }
          }
        } finally {
          reader.releaseLock()
        }

        // Return final accumulated response in expected format
        return WebhookResponseSchema.parse({
          answer: accumulatedAnswer.trim()
        })
      } else {
        // Fall back to JSON response for non-streaming
        const data = await response.json()
        return WebhookResponseSchema.parse(data)
      }
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
