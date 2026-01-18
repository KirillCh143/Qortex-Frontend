import { Building2, MessageSquare, BookOpen, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom' // 1. Импортируем хук
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  const location = useLocation() // 2. Получаем текущий путь
  const pathname = location.pathname

  // Общие стили для всех кнопок (отступы, ширина, скругление)
  const baseClasses = 'w-full justify-start gap-3 rounded-[8px]'

  // Стили для АКТИВНОЙ кнопки (Фиолетовый фон, белый текст)
  const activeClasses = 'bg-[#7049f3] text-white hover:bg-[#7049f3]/90'

  // Стили для ОБЫЧНОЙ кнопки (Прозрачный фон, черный текст, серый при наведении)
  const inactiveClasses = 'bg-transparent text-black hover:bg-gray-100'

  return (
    // Важно: поменял bg-primary на bg-white, чтобы черный текст был виден
    <div className="flex h-screen w-64 flex-col bg-white border-r text-black">
      {/* Branding Section */}
      <div className="flex items-center gap-3 p-6">
        <Building2 className="h-8 w-8 text-[#7049f3]" />
        <h1 className="text-xl font-bold">ИРБ ПРО</h1>
      </div>

      <Separator className="bg-gray-200" />

      {/* Navigation Section */}
      <nav className="flex flex-col items-start gap-2 p-4">
        {/* Кнопка Chat */}
        <Button
          variant="ghost" // Используем ghost как базу, чтобы убрать рамки
          className={`${baseClasses} ${pathname === '/chat' ? activeClasses : inactiveClasses}`}
          asChild
        >
          <Link to="/chat">
            <MessageSquare className="h-5 w-5" />
            Chat
          </Link>
        </Button>

        {/* Кнопка Knowledge Base */}
        <Button
          variant="ghost"
          className={`${baseClasses} ${
            pathname === '/knowledge-base' ? activeClasses : inactiveClasses
          }`}
          asChild
        >
          <Link to="/knowledge-base">
            <BookOpen className="h-5 w-5" />
            Knowledge Base
          </Link>
        </Button>

        {/* Кнопка Settings */}
        <Button
          variant="ghost"
          className={`${baseClasses} ${pathname === '/settings' ? activeClasses : inactiveClasses}`}
          asChild
        >
          <Link to="/settings">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </Button>
      </nav>
    </div>
  )
}
