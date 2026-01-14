import { useMutation } from '@tanstack/react-query'
import { webhookService } from '@/lib/config'
import type { ChatQueryPayload, WebhookResponse } from '@/services/n8n/types'

/**
 * React Query mutation hook for chat queries
 *
 * Chat queries are mutations (not queries) because:
 * - They have side effects (create conversation state)
 * - Each query should trigger a new request (no caching)
 * - They modify data rather than just fetch it
 *
 * Mutations don't retry by default (retry: 0), which is correct for chat queries
 */
export const useChatQuery = () => {
  return useMutation<WebhookResponse, Error, ChatQueryPayload>({
    mutationFn: (payload: ChatQueryPayload) => webhookService.sendQuery(payload)
  })
}
