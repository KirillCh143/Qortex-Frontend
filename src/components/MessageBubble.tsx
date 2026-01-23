import { User, Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  mode?: 'rag' | 'llm'
}

export default function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user'

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback
          className={
            isUser ? 'bg-[#8466e4] text-white' : 'bg-white text-gray-900 border border-[#cbd1d8]'
          }
        >
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[50%]`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'rounded-tr-none bg-[#8466e4] text-white' // Прямой угол справа сверху
              : 'rounded-tl-none bg-white text-gray-900 shadow-sm shadow-black/5 border border-[#e2e8f0]' // Прямой угол слева сверху
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="text-sm break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-900">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-900">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-900">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-gray-900">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-gray-900">{children}</em>,
                  code: ({ children, className }) => {
                    const isInline = !className?.includes('language-')
                    return isInline ? (
                      <code className="bg-gray-200 text-gray-900 px-1 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-800 text-white p-3 rounded my-3 text-sm font-mono overflow-x-auto">
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => <pre className="my-3">{children}</pre>,
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold mb-2 text-gray-900">{children}</h3>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {timestamp && <span className="text-xs text-gray-500 mt-1">{formatTime(timestamp)}</span>}
      </div>
    </div>
  )
}
