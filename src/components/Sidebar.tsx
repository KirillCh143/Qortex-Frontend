import { MessageSquare, BookOpen, Settings, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom' // 1. Импортируем хук
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

export function Sidebar() {
  const location = useLocation() // 2. Получаем текущий путь
  const pathname = location.pathname
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Общие стили для всех кнопок (отступы, ширина, скругление)
  const baseClasses = 'w-full justify-start gap-3 rounded-[8px]'

  // Стили для АКТИВНОЙ кнопки (Фиолетовый фон, белый текст)
  const activeClasses = 'bg-[#7049f3] text-white hover:bg-[#7049f3]/90'

  // Стили для ОБЫЧНОЙ кнопки (Прозрачный фон, черный текст, серый при наведении)
  const inactiveClasses = 'bg-transparent text-black hover:bg-gray-100'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/login')
    }
  }

  // Calculate user initials
  const getInitials = () => {
    if (!user?.first_name || !user?.last_name) return 'U'
    const firstInitial = user.first_name.charAt(0).toUpperCase()
    const lastInitial = user.last_name.charAt(0).toUpperCase()
    return `${firstInitial}${lastInitial}`
  }

  return (
    // Важно: поменял bg-primary на bg-white, чтобы черный текст был виден
    <div className="flex h-screen w-64 flex-col justify-between bg-white border-r text-black">
      <div>
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

      {/* User Section at Bottom */}
      <div className="p-4">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-[#8466e4] to-[#7049f3] text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-gray-100 flex-shrink-0"
            title="Выйти"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
