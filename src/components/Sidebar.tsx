import { Building2, MessageSquare, BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-primary text-white">
      {/* Branding Section */}
      <div className="flex items-center gap-3 p-6">
        <Building2 className="h-8 w-8" />
        <h1 className="text-xl font-bold">Company Name</h1>
      </div>

      <Separator className="bg-white/20" />

      {/* Navigation Section */}
      <nav className="flex flex-col items-start gap-2 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-secondary/20 hover:text-white"
        >
          <MessageSquare className="h-5 w-5" />
          Chat
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-secondary/20 hover:text-white"
        >
          <BookOpen className="h-5 w-5" />
          Knowledge Base
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-secondary/20 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </nav>
    </div>
  )
}
