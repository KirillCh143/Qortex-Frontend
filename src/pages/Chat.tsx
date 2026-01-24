import { useState, useEffect, useRef } from 'react'
import MessageBubble from '@/components/MessageBubble'
import ChatInput from '@/components/ChatInput'
import { Header } from '@/components/Header'
import { Bot } from 'lucide-react'
import { useChatQuery } from '@/hooks/useChatQuery'
import { useChatMessages, useSaveChatMessage, useClearChatHistory } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'

export default function Chat() {
  const { user } = useAuth()
  const [mode, setMode] = useState<'rag' | 'llm'>('rag')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatMutation = useChatQuery()

  // Fetch chat messages from Directus (user-specific and mode-specific)
  const { data: messages = [], isLoading, error } = useChatMessages(user?.id, mode)
  const saveMutation = useSaveChatMessage()
  const clearMutation = useClearChatHistory()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages.length])

  const handleSend = (content: string) => {
    if (!user?.id) return

    // Save user message to Directus
    saveMutation.mutate(
      {
        user: user.id,
        role: 'user',
        content,
        mode,
      },
      {
        onSuccess: () => {
          // Send query to webhook service (mock or real)
          chatMutation.mutate(
            {
              question: content,
              mode,
              sessionId: crypto.randomUUID(),
              history: messages.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            },
            {
              onSuccess: (data) => {
                // Save assistant response to Directus
                saveMutation.mutate({
                  user: user.id,
                  role: 'assistant',
                  content: data.answer,
                  mode,
                })
              },
              onError: (error) => {
                // Save error message to Directus
                saveMutation.mutate({
                  user: user.id,
                  role: 'assistant',
                  content: `Error: ${error.message}`,
                  mode,
                })
              },
            }
          )
        },
      }
    )
  }

  const handleClearHistory = () => {
    if (!user?.id) return
    const modeName = mode === 'rag' ? 'RAG Search' : 'LLM Chat'
    if (window.confirm(`Clear ${modeName} history? This cannot be undone.`)) {
      clearMutation.mutate({ userId: user.id, mode })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with mode toggle */}
      <Header mode={mode} onModeChange={setMode} />

      {/* Container for messages and overlaying chat input */}
      <div className="flex-1 relative overflow-hidden">
        {/* Messages container with scroll */}
        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto p-4 pb-32 bg-[#fdfefe]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Loading chat history...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>Error loading chat: {error.message}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8d6df5] to-[#7049f3] flex items-center justify-center shadow-xl shadow-[#7049f3]/20">
                <Bot size={40} className="text-white" strokeWidth={2} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Чем я могу вам помочь?</h2>
                <p className="text-base text-gray-500">
                  Чтобы начать общение, напишите сообщение ниже.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={new Date(message.timestamp)}
                  mode={message.mode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat input floating on top at bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="pointer-events-auto">
            <ChatInput
              onSend={handleSend}
              onClearHistory={handleClearHistory}
              messageCount={messages.length}
              disabled={chatMutation.isPending || saveMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
