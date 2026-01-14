import { useState, useEffect, useRef } from 'react'
import MessageBubble from '@/components/MessageBubble'
import ChatInput from '@/components/ChatInput'
import { Button } from '@/components/ui/button'
import { useChatQuery } from '@/hooks/useChatQuery'
import { loadMessages, saveMessages, type Message } from '@/lib/chatStorage'
import { loadSettings } from '@/lib/settings'
import { Trash2 } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [mode, setMode] = useState<'rag' | 'llm'>('rag')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatMutation = useChatQuery()

  // Load messages from localStorage on mount (conditionally based on persistence setting)
  useEffect(() => {
    const settings = loadSettings()

    // If persistence is disabled, clear any stale messages from localStorage
    if (!settings.messagePersistence) {
      const staleMessages = localStorage.getItem('chat-messages')
      if (staleMessages) {
        localStorage.removeItem('chat-messages')
      }
      setMessages([])
      return
    }

    // If persistence is enabled, load messages
    const savedMessages = loadMessages()
    setMessages(savedMessages)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages.length])

  const handleSend = (content: string) => {
    const settings = loadSettings()

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Only save if persistence is enabled
    if (settings.messagePersistence) {
      saveMessages(updatedMessages)
    }

    // Send query to webhook service (mock or real)
    chatMutation.mutate(
      {
        question: content,
        mode,
        sessionId: crypto.randomUUID(),
        history: messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      },
      {
        onSuccess: (data) => {
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.answer,
            timestamp: new Date(),
            mode
          }
          setMessages(prev => {
            const newMessages = [...prev, assistantMessage]

            // Only save if persistence is enabled
            if (settings.messagePersistence) {
              saveMessages(newMessages)
            }

            return newMessages
          })
        },
        onError: (error) => {
          const errorMessage: Message = {
            role: 'assistant',
            content: `Error: ${error.message}`,
            timestamp: new Date(),
            mode
          }
          setMessages(prev => {
            const newMessages = [...prev, errorMessage]

            // Only save if persistence is enabled
            if (settings.messagePersistence) {
              saveMessages(newMessages)
            }

            return newMessages
          })
        }
      }
    )
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear all chat history? This cannot be undone.')) {
      setMessages([])
      saveMessages([])
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle */}
      <div className="border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant={mode === 'rag' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('rag')}
                className={mode === 'rag' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
              >
                RAG Search
              </Button>
              <Button
                variant={mode === 'llm' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('llm')}
                className={mode === 'llm' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
              >
                LLM Chat
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={messages.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>
        </div>
      </div>

      {/* Messages container with scroll */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                mode={message.mode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat input at bottom */}
      <ChatInput onSend={handleSend} disabled={chatMutation.isPending} />
    </div>
  )
}
