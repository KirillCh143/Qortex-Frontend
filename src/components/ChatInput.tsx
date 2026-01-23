import { useState, useRef, KeyboardEvent } from 'react'
import { SendHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  onClearHistory?: () => void
  messageCount?: number
  disabled?: boolean
}

export default function ChatInput({
  onSend,
  onClearHistory,
  messageCount = 0,
  disabled = false,
}: ChatInputProps) {
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
    <div className="bg-[#f8f9fc] p-4">
      {/* Constrain content to match message area width */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 items-end">
          {/* Clear History button (left side) */}
          {onClearHistory && (
            <Button
              onClick={onClearHistory}
              disabled={messageCount === 0}
              className="rounded-xl w-14 h-14 flex items-center justify-center shadow-sm shadow-black/5 bg-white border border-slate-200/60 text-slate-500 hover:border-[#f47c7c] hover:text-[#f15757] transition-all"
            >
              <Trash2 size={10} />
            </Button>
          )}

          {/* Input capsule with textarea and send button */}
          <div className="mb-[2px] flex-1 flex items-end gap-2 rounded-xl shadow-sm shadow-black/5 px-3 py-2 bg-white border border-slate-200/60 hover:border-slate-300 focus-within:border-[#8466e4] focus-within:hover:border-[#8466e4] transition-all">
            {/* Text input area */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Введите сообщение..."
              className="flex-1 resize-none text-sm focus:outline-none overflow-y-auto bg-transparent border-0 px-4 py-2"
              rows={1}
              style={{ minHeight: '24px', maxHeight: '72px' }}
              disabled={disabled}
            />

            {/* Send button inside capsule (right side) */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className="bg-[#8466e4] hover:bg-[#7049f3] text-white rounded-lg h-9 w-9 p-0 flex items-center justify-center shrink-0"
            >
              <SendHorizontal size={16} />
            </Button>
          </div>
        </div>

        {/* Disclaimer text */}
        <p className="text-xs text-gray-500 text-center mt-2">
          AI может ошибаться. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  )
}
