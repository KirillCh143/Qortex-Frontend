interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="w-full h-20 bg-white border-b flex items-center px-6 py-4">
      {/* Page title section */}
      <h1 className="text-2xl font-semibold text-[#1e3a8a]">{title}</h1>
    </header>
  )
}
