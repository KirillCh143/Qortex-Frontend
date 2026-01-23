interface HeaderProps {
  title?: string
  mode?: 'rag' | 'llm'
  onModeChange?: (mode: 'rag' | 'llm') => void
}

export function Header({ title, mode, onModeChange }: HeaderProps) {
  return (
    <header
      className={`w-full h-20 bg-white border-b flex items-center px-6 py-4 ${title ? 'justify-between' : 'justify-center'}`}
    >
      {/* Page title section */}
      {title && <h1 className="text-2xl font-semibold text-[#1e3a8a]">{title}</h1>}

      {/* Mode toggle - Segmented Control (only shown when mode props are provided) */}
      {mode && onModeChange && (
        <div className="relative flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          {/* Sliding background */}
          <div
            className={`absolute top-1 bottom-1 w-32 bg-white rounded-[10px] shadow-sm transition-all duration-300 ease-in-out ${
              mode === 'rag' ? 'left-1' : 'left-[140px]'
            }`}
          />

          <button
            onClick={() => onModeChange('rag')}
            className={`relative z-10 w-32 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
              mode === 'rag' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            База знаний
          </button>
          <button
            onClick={() => onModeChange('llm')}
            className={`relative z-10 w-32 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
              mode === 'llm' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Gemini
          </button>
        </div>
      )}
    </header>
  )
}
