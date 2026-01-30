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

      // Check if response is streaming
      const contentType = response.headers.get('Content-Type') || ''
      const isStreaming = contentType.includes('text/event-stream') || contentType.includes('text/plain')

      if (isStreaming && response.body && onChunk) {
        // Handle streaming response
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedAnswer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6).trim()
                if (data && data !== '[DONE]') {
                  try {
                    // Try parsing as JSON first (in case n8n sends JSON chunks)
                    const parsed = JSON.parse(data)
                    if (parsed.answer) {
                      accumulatedAnswer += parsed.answer
                      onChunk(accumulatedAnswer)
                    } else if (typeof parsed === 'string') {
                      accumulatedAnswer += parsed
                      onChunk(accumulatedAnswer)
                    }
                  } catch {
                    // If not JSON, treat as plain text
                    accumulatedAnswer += data
                    onChunk(accumulatedAnswer)
                  }
                }
              } else if (line.trim() && !line.startsWith(':')) {
                // Plain text chunk (not SSE format)
                accumulatedAnswer += line
                onChunk(accumulatedAnswer)
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        // Return final accumulated response
        return WebhookResponseSchema.parse({
          answer: accumulatedAnswer
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
