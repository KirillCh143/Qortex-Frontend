import { useState, useLayoutEffect, useRef } from 'react'
import MessageBubble from '@/components/MessageBubble'
import ChatInput from '@/components/ChatInput'
import { Bot } from 'lucide-react'
import { useChatQuery } from '@/hooks/useChatQuery'
import { useChatMessages, useSaveChatMessage, useClearChatHistory } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Chat() {
  const { user } = useAuth()
  const [mode] = useState<'rag' | 'llm'>('rag')
  const [streamingResponse, setStreamingResponse] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatMutation = useChatQuery()

  // Fetch chat messages from Directus (user-specific and mode-specific)
  const { data: messages = [], isLoading, error } = useChatMessages(user?.id, mode)
  const saveMutation = useSaveChatMessage()
  const clearMutation = useClearChatHistory()

  // Clear streaming state only after the persisted bot message appears in history
  // useLayoutEffect ensures this runs before the browser paints, avoiding a flash
  useLayoutEffect(() => {
    if (isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setIsStreaming(false)
      setStreamingResponse('')
    }
  }, [messages, isStreaming])

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages.length, streamingResponse])

  const handleSend = (content: string) => {
    if (!user?.id) return

    // Generate sessionidkey from user data
    const sessionidkey = user.first_name && user.last_name
      ? `${user.first_name}_${user.last_name}`
      : user.first_name || user.last_name
      ? `User_${user.id}`
      : 'Unknown_User'

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
          // Reset streaming state
          setIsStreaming(false)
          setStreamingResponse('')

          // Send query to webhook service (mock or real) with streaming callback
          chatMutation.mutate(
            {
              question: content,
              mode,
              sessionId: crypto.randomUUID(),
              sessionidkey,
              history: messages.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              onChunk: (text: string) => {
                // First chunk: hide typing indicator, show streaming
                if (!isStreaming) {
                  setIsStreaming(true)
                }
                // Update streaming response as chunks arrive
                setStreamingResponse(text)
              },
            },
            {
              onSuccess: (data) => {
                // Keep streaming bubble visible with final text while saving
                // The useEffect will clear streaming state once the message is persisted
                setStreamingResponse(data.answer)

                saveMutation.mutate({
                  user: user.id,
                  role: 'assistant',
                  content: data.answer,
                  mode,
                })
              },
              onError: (error) => {
                // Stream failed - save error message, keep bubble visible
                const errorContent = streamingResponse
                  ? `${streamingResponse}\n\n[Error: ${error.message}]`
                  : `Error: ${error.message}`
                setStreamingResponse(errorContent)

                saveMutation.mutate({
                  user: user.id,
                  role: 'assistant',
                  content: errorContent,
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
      {/* <Header mode={mode} onModeChange={setMode} /> */}

      {/* Container for messages and overlaying chat input */}
      <div className="flex-1 relative overflow-hidden">
        {/* Messages container with scroll */}
        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto p-4 pb-32 bg-[#fbfcfd]"
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

              {/* Streaming response */}
              {isStreaming && streamingResponse && (
                <MessageBubble
                  role="assistant"
                  content={streamingResponse}
                  timestamp={new Date()}
                  mode={mode}
                />
              )}

              {/* Typing indicator - show only when pending but not yet streaming */}
              {chatMutation.isPending && !isStreaming && (
                <div className="flex gap-3 mb-4 flex-row">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#8d6df5] to-[#7049f3] text-white">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-start max-w-[50%]">
                    <div className="rounded-xl rounded-tl-none px-4 py-3 bg-white text-gray-900 border shadow-lg shadow-slate-100 h-11">
                      <div className="flex gap-1.5 pt-1.25">
                        <div
                          className="w-2 h-2 bg-[#7049f3]/90 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-[#7049f3]/90 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-[#7049f3]/90 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
