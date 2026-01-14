import { z } from 'zod'

// Schema for chat query payload sent to n8n webhook
export const ChatQueryPayloadSchema = z.object({
  question: z.string().min(1),
  mode: z.enum(['rag', 'llm']),
  sessionId: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
})

// Schema for webhook response from n8n
export const WebhookResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    relevance: z.number().optional()
  })).optional()
})

// Inferred TypeScript types
export type ChatQueryPayload = z.infer<typeof ChatQueryPayloadSchema>
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>
