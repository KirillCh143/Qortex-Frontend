import { MessageSquare, BookOpen, Settings } from 'lucide-react'
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
      <div className="flex items-center gap-4 p-5">
        <div className="size-10 rounded-xl bg-gradient-to-br from-[#7e5bf4] to-[#7049f3] flex items-center justify-center text-white shadow-xl shadow-primary/50">
          <img src="/logo.svg" alt="Logo" className="h-7 w-7" />
        </div>
        <h1 className="text-lg font-bold">База знаний</h1>
      </div>

      <Separator className="bg-white" />

      {/* "Меню" text */}
      <div className="text-xs uppercase text-gray-500 font-semibold ml-8 mt-4">Меню</div>

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
            ИИ Чат
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
            Докумненты
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
            Настройки
          </Link>
        </Button>
      </nav>
    </div>
  )
}
