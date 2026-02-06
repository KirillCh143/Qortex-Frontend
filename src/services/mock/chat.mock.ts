import type { ChatMessage, ChatService } from '../directus/types';
import { generateUUID } from '@/lib/utils';

// In-memory store for mock mode (simulates per-user storage)
const mockStore = new Map<string, ChatMessage[]>();

export function createMockChatService(): ChatService {
  return {
    async getMessages(userId: string, mode?: 'rag' | 'llm'): Promise<ChatMessage[]> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const messages = mockStore.get(userId) || [];
      if (mode) {
        return messages.filter((msg) => msg.mode === mode);
      }
      return messages;
    },

    async saveMessage(
      message: Omit<ChatMessage, 'id' | 'timestamp'>
    ): Promise<ChatMessage> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      const newMessage: ChatMessage = {
        id: generateUUID(),
        ...message,
        timestamp: new Date().toISOString(),
      };

      const messages = mockStore.get(message.user) || [];
      mockStore.set(message.user, [...messages, newMessage]);
      return newMessage;
    },

    async clearMessages(userId: string, mode?: 'rag' | 'llm'): Promise<void> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (mode) {
        const messages = mockStore.get(userId) || [];
        const filteredMessages = messages.filter((msg) => msg.mode !== mode);
        if (filteredMessages.length > 0) {
          mockStore.set(userId, filteredMessages);
        } else {
          mockStore.delete(userId);
        }
      } else {
        mockStore.delete(userId);
      }
    },
  };
}
