import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/lib/config';
import type { ChatMessage } from '@/services/directus/types';

export function useChatMessages(userId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return chatService.getMessages(userId);
    },
    enabled: !!userId, // only fetch when userId is available
    staleTime: 0, // always fetch fresh chat history on mount
  });
}

export function useSaveChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: Omit<ChatMessage, 'id' | 'timestamp'>) =>
      chatService.saveMessage(message),
    onSuccess: (_, variables) => {
      // Invalidate cache for this user's messages
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.user] });
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => chatService.clearMessages(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', userId] });
    },
  });
}
