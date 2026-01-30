import { Home, HardHat, Banknote, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePrefetchPage } from "@/hooks/usePrefetchPage";

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
  const prefetch = usePrefetchPage();

  const prefetchMap: Record<string, () => void> = {
    "/": prefetch.prefetchDashboard,
    "/projetos": prefetch.prefetchProjetos,
    "/financas": prefetch.prefetchFinancas,
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onPointerDown={() => prefetchMap[item.path]?.()}
              onTouchStart={() => prefetchMap[item.path]?.()}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300",
                "touch-manipulation",
                active 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Bubble/pill background for active state */}
              {active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 transition-all duration-300 animate-scale-in" />
              )}
              <item.icon className={cn(
                "h-5 w-5 relative z-10 transition-transform duration-300",
                active && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium relative z-10 transition-all duration-300",
                active ? "text-primary font-semibold" : ""
              )}>{item.label}</span>
            </NavLink>
          );
        })}
        
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
