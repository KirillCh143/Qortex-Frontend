import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  onClearHistory?: () => void
  messageCount?: number
  disabled?: boolean
}

export default function ChatInput({ onSend, onClearHistory, messageCount = 0, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 96) // Max 4 rows (24px per row)
    textarea.style.height = `${newHeight}px`
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2 items-end">
        {/* Clear History button (left side) */}
        {onClearHistory && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            disabled={messageCount === 0}
            className="flex items-center gap-2 hover:border-gray-400 h-10"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}

        {/* Input capsule with textarea and send button */}
        <div className="flex-1 flex items-end gap-2 rounded-xl border border-gray-300 px-3 py-2 focus-within:ring-2 focus-within:ring-[#8466e4] focus-within:border-transparent bg-white">
          {/* Text input area */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 resize-none text-sm focus:outline-none overflow-y-auto bg-transparent border-0 p-0"
            rows={1}
            style={{ minHeight: '24px', maxHeight: '72px' }}
            disabled={disabled}
          />

          {/* Send button inside capsule (right side) */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="bg-[#8466e4] hover:bg-[#7049f3] text-white rounded-full h-8 w-8 p-0 flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Disclaimer text */}
      <p className="text-xs text-gray-500 text-center mt-2">
        AI может ошибаться. Проверяйте важную информацию.
      </p>
    </div>
  )
}
