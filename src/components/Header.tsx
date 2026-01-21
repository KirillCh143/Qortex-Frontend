interface HeaderProps {
  title: string
  mode?: 'rag' | 'llm'
  onModeChange?: (mode: 'rag' | 'llm') => void
}

export function Header({ title, mode, onModeChange }: HeaderProps) {
  return (
    <header className="w-full h-20 bg-white border-b flex items-center justify-between px-6 py-4">
      {/* Page title section */}
      <h1 className="text-2xl font-semibold text-[#1e3a8a]">{title}</h1>

      {/* Mode toggle - Segmented Control (only shown when mode props are provided) */}
      {mode && onModeChange && (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onModeChange('rag')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'rag'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            RAG Search
          </button>
          <button
            onClick={() => onModeChange('llm')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'llm'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            LLM Chat
          </button>
        </div>
      )}
    </header>
  )
}
