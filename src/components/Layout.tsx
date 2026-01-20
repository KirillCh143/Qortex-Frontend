import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col h-screen">
        <Header title={title} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
