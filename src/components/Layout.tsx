import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-gray-50">
        <Header title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
