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

      // Get response data
      const data = await response.json()

      // Handle n8n AI Agent JSON wrapper format: {"output": "text"}
      let answerText: string
      if (data.output) {
        answerText = data.output
      } else if (data.answer) {
        answerText = data.answer
      } else {
        answerText = JSON.stringify(data)
      }

      // Simulate streaming for ChatGPT-like UX (since n8n doesn't stream token-by-token)
      if (onChunk) {
        const words = answerText.split(' ')
        let accumulated = ''

        for (let i = 0; i < words.length; i++) {
          accumulated += (i > 0 ? ' ' : '') + words[i]
          onChunk(accumulated)
          // 30ms delay between words for smooth streaming effect
          await new Promise(resolve => setTimeout(resolve, 30))
        }
      }

      // Return final response
      return WebhookResponseSchema.parse({
        answer: answerText,
        sources: data.sources
      })
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
