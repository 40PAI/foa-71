import { Home, HardHat, Banknote, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: HardHat, label: "Projetos", path: "/projetos" },
  { icon: Banknote, label: "Finanças", path: "/financas" },
];

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              "active:bg-muted/50 touch-manipulation",
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        <button
          onClick={onMoreClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            "active:bg-muted/50 touch-manipulation",
            "text-muted-foreground hover:text-foreground"
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs font-medium">Mais</span>
        </button>
      </div>
    </nav>
  );
}
