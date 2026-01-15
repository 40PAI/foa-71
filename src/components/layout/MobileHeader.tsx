import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import foaLogo from "@/assets/foa-logo-official.png";

export function MobileHeader() {
  const { user, profile } = useAuth();
  
  const userName = profile?.nome || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <img 
            src={foaLogo} 
            alt="FOA Logo" 
            className="h-8 w-auto"
          />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{getGreeting()},</span>
            <span className="text-sm font-medium truncate max-w-[120px]">{userName.split(' ')[0]}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationPanel />
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
