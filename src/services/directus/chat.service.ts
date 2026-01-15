import { readItems, createItem, deleteItems } from '@directus/sdk';
import type { ChatMessage, ChatService } from './types';

// Real implementation using Directus SDK
// Using any type for client since DirectusClient type doesn't reflect .with() extensions
export function createRealChatService(directusClient: any): ChatService {
  return {
    async getMessages(userId: string): Promise<ChatMessage[]> {
      const messages = await directusClient.request(
        // @ts-ignore - Custom collection not in SDK types
        readItems('chat_messages', {
          filter: { user: { _eq: userId } },
          sort: ['timestamp'],
          limit: -1, // all messages
        })
      );
      return messages as ChatMessage[];
    },

    async saveMessage(
      message: Omit<ChatMessage, 'id' | 'timestamp'>
    ): Promise<ChatMessage> {
      const created = await directusClient.request(
        // @ts-ignore - Custom collection not in SDK types
        createItem('chat_messages', {
          user: message.user,
          role: message.role,
          content: message.content,
          mode: message.mode,
          timestamp: new Date().toISOString(),
        })
      );
      return created as ChatMessage;
    },

    async clearMessages(userId: string): Promise<void> {
      await directusClient.request(
        // @ts-ignore - Custom collection not in SDK types
        deleteItems('chat_messages', {
          filter: { user: { _eq: userId } },
        })
      );
    },
  };
}
