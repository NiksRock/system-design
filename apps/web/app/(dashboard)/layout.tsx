import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="font-semibold">Dashboard</h1>

        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <LogoutButton />
        </div>
      </header>

      <div>{children}</div>
    </div>
  );
}
