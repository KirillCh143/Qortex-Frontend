import { useState, useEffect } from 'react'
import MessageBubble from '@/components/MessageBubble'
import ChatInput from '@/components/ChatInput'
import { Button } from '@/components/ui/button'
import { generateMockResponse } from '@/lib/mockResponses'
import { loadMessages, saveMessages, type Message } from '@/lib/chatStorage'

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [mode, setMode] = useState<'rag' | 'llm'>('rag')

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = loadMessages()
    setMessages(savedMessages)
  }, [])

  const handleSend = (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    saveMessages(updatedMessages)

    // Add mock assistant response after 500ms
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: generateMockResponse(mode, content),
        timestamp: new Date(),
        mode
      }
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage]
        saveMessages(newMessages)
        return newMessages
      })
    }, 500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle */}
      <div className="border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
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
        </div>
      </div>

      {/* Messages container with scroll */}
      <div className="flex-1 overflow-y-auto p-4">
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
      <ChatInput onSend={handleSend} />
    </div>
  )
}
