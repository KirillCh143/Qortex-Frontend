import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      // If logout fails, clear client state and redirect anyway
      console.error('Logout failed:', error)
      navigate('/login')
    }
  }

  return (
    <header className="w-full h-20 bg-white border-b flex items-center justify-between px-6 py-4">
      {/* Page title section (left) */}
      <h1 className="text-2xl font-semibold text-[#1e3a8a]">{title}</h1>

      {/* User section (right) */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="hover:bg-gray-100"
          title="Logout"
        >
          <LogOut size={18} />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#3b82f6] text-white">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
