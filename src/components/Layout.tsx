import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  hideHeader?: boolean
}

export function Layout({ children, title, hideHeader }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col h-screen">
        {!hideHeader && title && <Header title={title} />}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
