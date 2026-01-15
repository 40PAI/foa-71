import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { MobileProjectSelector } from "@/components/mobile/MobileProjectSelector";
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
      {/* Linha principal */}
      <div className="flex items-center justify-between h-12 px-3">
        <div className="flex items-center gap-2">
          <img 
            src={foaLogo} 
            alt="FOA Logo" 
            className="h-7 w-auto"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-muted-foreground">{getGreeting()},</span>
            <span className="text-xs font-medium truncate max-w-[80px]">{userName.split(' ')[0]}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationPanel />
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Linha de seleção de projeto */}
      <div className="flex items-center h-10 px-3 border-t border-border/50 bg-muted/30">
        <MobileProjectSelector />
      </div>
    </header>
  );
}
