import type { ChatMessage, ChatService } from '../directus/types';

// In-memory store for mock mode (simulates per-user storage)
const mockStore = new Map<string, ChatMessage[]>();

export function createMockChatService(): ChatService {
  return {
    async getMessages(userId: string): Promise<ChatMessage[]> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockStore.get(userId) || [];
    },

    async saveMessage(
      message: Omit<ChatMessage, 'id' | 'timestamp'>
    ): Promise<ChatMessage> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        ...message,
        timestamp: new Date().toISOString(),
      };

      const messages = mockStore.get(message.user) || [];
      mockStore.set(message.user, [...messages, newMessage]);
      return newMessage;
    },

    async clearMessages(userId: string): Promise<void> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      mockStore.delete(userId);
    },
  };
}
