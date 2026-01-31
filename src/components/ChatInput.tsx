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
    <div className="p-5 bg-[#fbfcfd]">
      {/* Constrain content to match message area width */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 items-end">
          {/* Clear History button (left side) */}
          {onClearHistory && (
            <Button
              onClick={onClearHistory}
              disabled={messageCount === 0}
              title="Очистить историю чата"
              className="mb-[1px] shadow-xl shadow-indigo-500/10 rounded-xl w-14 h-14 flex items-center justify-center bg-white backdrop-blur-sm border border-slate-300 text-slate-400 hover:bg-[#fef2f2] hover:border-[#f47c7c] hover:text-[#f15757] transition-all"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}

          {/* Input capsule with textarea and send button */}
          <div className="shadow-lg shadow-indigo-500/10 mb-[2px] flex-1 flex items-end gap-2 rounded-xl px-2 py-2 bg-white backdrop-blur-sm border border-slate-300 hover:border-violet-300 focus-within:border-[#7049f3] focus-within:hover:border-[#7049f3] transition-all">
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
              className="bg-[#7049f3]/90 hover:bg-[#7049f3] text-white rounded-lg h-9 w-9 p-0 flex items-center justify-center shrink-0"
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
