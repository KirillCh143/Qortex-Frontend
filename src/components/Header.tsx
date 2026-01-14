import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6 py-4">
      {/* Page title section (left) */}
      <h1 className="text-2xl font-semibold text-[#1e3a8a]">{title}</h1>

      {/* User section (right) */}
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-[#3b82f6] text-white">
          JD
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
