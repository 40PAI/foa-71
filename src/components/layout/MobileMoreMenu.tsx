import { 
  Package, 
  Users, 
  Shield, 
  ClipboardList, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Building2,
  Receipt,
  Truck,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePrefetchPage } from "@/hooks/usePrefetchPage";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MobileMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: Package, label: "Armazém", path: "/armazem", module: "armazem" },
  { icon: Users, label: "RH & Ponto", path: "/rh", module: "rh" },
  { icon: Shield, label: "Segurança", path: "/seguranca", module: "seguranca" },
  { icon: ClipboardList, label: "Tarefas", path: "/tarefas", module: "tarefas" },
  { icon: ShoppingCart, label: "Compras", path: "/compras", module: "compras" },
];

const financeSubItems = [
  { icon: Building2, label: "Centros de Custo", path: "/centros-custo" },
  { icon: Receipt, label: "Gastos de Obra", path: "/gastos-obra" },
  { icon: Truck, label: "Fornecedores", path: "/contas-fornecedores" },
];

export function MobileMoreMenu({ open, onOpenChange }: MobileMoreMenuProps) {
  const navigate = useNavigate();
  const { signOut, canAccessModule, isDirector } = useAuth();
  const prefetch = usePrefetchPage();

  const prefetchMap: Record<string, () => void> = {
    "/armazem": prefetch.prefetchArmazem,
    "/rh": prefetch.prefetchRH,
    "/seguranca": prefetch.prefetchSeguranca,
    "/tarefas": prefetch.prefetchTarefas,
    "/compras": prefetch.prefetchCompras,
    "/centros-custo": prefetch.prefetchCentrosCusto,
    "/gastos-obra": prefetch.prefetchFinancas,
    "/contas-fornecedores": prefetch.prefetchContasFornecedores,
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl safe-area-bottom">
        <SheetHeader className="text-left pb-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-1 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            if (!canAccessModule(item.module)) return null;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                onPointerDown={() => prefetchMap[item.path]?.()}
                onTouchStart={() => prefetchMap[item.path]?.()}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-lg",
                  "text-left transition-colors",
                  "hover:bg-muted active:bg-muted/80 touch-manipulation"
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}

          <Separator className="my-3" />
          
          {/* Finance Sub-items */}
          <p className="px-4 py-2 text-sm font-medium text-muted-foreground">Finanças</p>
          {financeSubItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              onPointerDown={() => prefetchMap[item.path]?.()}
              onTouchStart={() => prefetchMap[item.path]?.()}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-lg",
                "text-left transition-colors",
                "hover:bg-muted active:bg-muted/80 touch-manipulation"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                <item.icon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="flex-1 font-medium">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}

          {isDirector() && (
            <>
              <Separator className="my-3" />
              <button
                onClick={() => handleNavigation("/gestao-usuarios")}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-lg",
                  "text-left transition-colors",
                  "hover:bg-muted active:bg-muted/80 touch-manipulation"
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <span className="flex-1 font-medium">Gestão de Usuários</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          )}

          <Separator className="my-3" />
          
          {/* Logout */}
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-lg",
              "text-left transition-colors",
              "hover:bg-destructive/10 active:bg-destructive/20 touch-manipulation",
              "text-destructive"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="flex-1 font-medium">Sair</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
