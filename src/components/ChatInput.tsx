import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
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
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent overflow-y-auto"
          rows={1}
          style={{ minHeight: '40px', maxHeight: '96px' }}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 h-10"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  )
}
