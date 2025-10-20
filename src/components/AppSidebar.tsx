import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Settings, HardHat, Banknote, Wallet, ShoppingCart, Package, Users, Shield, CheckCircle, BarChart3, LogOut, User, UserCog, Menu, X, FileText, Building2, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
const roleLabels = {
  diretor_tecnico: 'Diretor Técnico',
  encarregado_obra: 'Encarregado de Obra',
  assistente_compras: 'Assistente de Compras',
  departamento_hst: 'Departamento HST',
  coordenacao_direcao: 'Coordenação/Direção'
};
const menuItems = [{
  title: "Projetos/Obras",
  icon: HardHat,
  path: "/",
  module: "projetos"
}, {
  title: "Compras",
  icon: ShoppingCart,
  path: "/compras",
  module: "compras"
}, {
  title: "Armazém",
  icon: Package,
  path: "/armazem",
  module: "armazem"
}, {
  title: "RH & Ponto",
  icon: Users,
  path: "/rh",
  module: "rh"
}, {
  title: "Segurança & Higiene",
  icon: Shield,
  path: "/seguranca",
  module: "seguranca"
}, {
  title: "Tarefas",
  icon: CheckCircle,
  path: "/tarefas",
  module: "tarefas"
}, {
  title: "Gráficos",
  icon: BarChart3,
  path: "/graficos",
  module: "graficos"
}];

const financasSubItems = [
  {
    title: "Centros de Custo",
    icon: Wallet,
    path: "/centros-custo",
  },
  {
    title: "Contas Fornecedores",
    icon: FileText,
    path: "/contas-fornecedores",
  },
  {
    title: "DRE",
    icon: Building2,
    path: "/dre",
  },
  {
    title: "Gastos da Obra",
    icon: Wallet,
    path: "/gastos-obra",
  },
  {
    title: "Relatórios FOA",
    icon: FileText,
    path: "/relatorios-foa",
  },
];
export function AppSidebar() {
  const {
    state,
    setOpenMobile,
    open: sidebarOpen,
    toggleSidebar
  } = useSidebar();
  const {
    profile,
    canAccessModule,
    isDirector,
    signOut
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // Filter items based on user permissions
  const filteredItems = menuItems.filter(item => canAccessModule(item.module));
  const hasFinancasAccess = canAccessModule("financas");
  const isFinancasPathActive = financasSubItems.some(item => currentPath === item.path);
  const [financasOpen, setFinancasOpen] = useState(isFinancasPathActive);
  
  // Sync dropdown state with current route
  useEffect(() => {
    if (isFinancasPathActive) {
      setFinancasOpen(true);
    }
  }, [isFinancasPathActive]);
  
  const handleNavClick = () => {
    setOpenMobile(false);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate("/auth");
    }
  };
  return <Sidebar className="bg-sidebar text-sidebar-foreground transition-all duration-300" collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-2 sm:p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 shrink-0" />
            {!isCollapsed && <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base lg:text-lg font-bold truncate">FOA</span>
                <span className="text-xs sm:text-sm font-semibold truncate">SmartSite</span>
              </div>}
          </div>
          {!isCollapsed && <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0 hover:bg-sidebar-accent text-sidebar-foreground" title="Fechar menu">
              <X className="h-4 w-4" />
            </Button>}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-1 sm:px-2">
        <SidebarMenu>
          {filteredItems.map(item => <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={currentPath === item.path} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3">
                <NavLink to={item.path} className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm" onClick={handleNavClick}>
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          
          {/* Finanças dropdown */}
          {hasFinancasAccess && (
            <SidebarGroup>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setFinancasOpen(!financasOpen)}
                  className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent min-h-[40px] sm:min-h-[48px] px-2 sm:px-3 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  isActive={isFinancasPathActive}
                >
                  <Banknote className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate flex-1 text-xs sm:text-sm">Finanças</span>}
                  {!isCollapsed && (
                    <ChevronRight className={`h-4 w-4 transition-transform ${financasOpen ? 'rotate-90' : ''}`} />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {financasOpen && !isCollapsed && (
                <SidebarMenuSub>
                  {financasSubItems.map(item => (
                    <SidebarMenuSubItem key={item.path}>
                      <SidebarMenuSubButton asChild isActive={currentPath === item.path}>
                        <NavLink 
                          to={item.path} 
                          className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm pl-8"
                          onClick={handleNavClick}
                        >
                          <item.icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarGroup>
          )}
          
          {isDirector() && <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPath === "/usuarios"} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3">
              <NavLink to="/usuarios" className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm" onClick={handleNavClick}>
                <UserCog className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="truncate">Gestão de Usuários</span>
              </NavLink>
            </SidebarMenuButton>
            </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        {profile && <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
            
            <Separator className="bg-sidebar-foreground/20" />
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]" onClick={handleSignOut}>
              <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Sair
            </Button>
          </div>}
      </SidebarFooter>
    </Sidebar>;
}