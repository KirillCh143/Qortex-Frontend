import { User, Bot, FileSearch, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  mode?: 'rag' | 'llm'
}

export default function MessageBubble({ role, content, timestamp, mode }: MessageBubbleProps) {
  const isUser = role === 'user'

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-700'}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`relative rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Mode badge for assistant messages */}
          {!isUser && mode && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
              {mode === 'rag' ? (
                <>
                  <FileSearch size={12} />
                  <span>RAG</span>
                </>
              ) : (
                <>
                  <MessageSquare size={12} />
                  <span>LLM</span>
                </>
              )}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-gray-500 mt-1">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}
