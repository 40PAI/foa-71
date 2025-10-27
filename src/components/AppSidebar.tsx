import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Home,
  HardHat,
  Banknote,
  Wallet,
  ShoppingCart,
  Package,
  Users,
  Shield,
  CheckCircle,
  BarChart3,
  LogOut,
  User,
  UserCog,
  Menu,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import foaLogo from "@/assets/foa-logo.png";
const roleLabels = {
  diretor_tecnico: "Diretor Técnico",
  encarregado_obra: "Encarregado de Obra",
  assistente_compras: "Assistente de Compras",
  departamento_hst: "Departamento HST",
  coordenacao_direcao: "Coordenação/Direção",
};
const menuItems = [
  {
    title: "Dashboard Geral",
    icon: Home,
    path: "/",
    module: "dashboard",
  },
  {
    title: "Projetos/Obras",
    icon: HardHat,
    path: "/projetos",
    module: "projetos",
  },
  {
    title: "Armazém",
    icon: Package,
    path: "/armazem",
    module: "armazem",
  },
  {
    title: "RH & Ponto",
    icon: Users,
    path: "/rh",
    module: "rh",
  },
  {
    title: "Segurança & Higiene",
    icon: Shield,
    path: "/seguranca",
    module: "seguranca",
  },
  {
    title: "Tarefas",
    icon: CheckCircle,
    path: "/tarefas",
    module: "tarefas",
  },
];

const financasItems = [
  {
    title: "Centros de Custo",
    icon: Wallet,
    path: "/centros-custo",
    module: "financas",
  },
  {
    title: "Compras",
    icon: ShoppingCart,
    path: "/compras",
    module: "compras",
  },
];

const contasFornecedoresItem = {
  title: "Contas Fornecedores",
  icon: FileText,
  path: "/contas-fornecedores",
  module: "financas",
};
export function AppSidebar() {
  const { state, setOpenMobile, open: sidebarOpen, toggleSidebar } = useSidebar();
  const { profile, canAccessModule, isDirector, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  const [financasOpen, setFinancasOpen] = useState(true);

  // Filter items based on user permissions
  const filteredItems = menuItems.filter((item) => canAccessModule(item.module));
  const filteredFinancasItems = financasItems.filter((item) => canAccessModule(item.module));
  const showContasFornecedores = canAccessModule(contasFornecedoresItem.module);
  
  // Split items for proper ordering
  const dashboardItem = filteredItems.find(item => item.path === "/");
  const projetosItem = filteredItems.find(item => item.path === "/projetos");
  const remainingItems = filteredItems.filter(
    item => item.path !== "/" && item.path !== "/projetos"
  );
  
  // Check if any financas route is active
  const isFinancasActive = filteredFinancasItems.some(item => currentPath === item.path) || currentPath === "/financas";
  const handleNavClick = () => {
    setOpenMobile(false);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/auth");
    }
  };
  return (
    <Sidebar
      className="bg-sidebar text-sidebar-foreground transition-all duration-300"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="p-2 sm:p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 min-w-0 flex-1">
            {!isCollapsed ? (
              <img 
                src={foaLogo} 
                alt="FOA Inovação e Negócios" 
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <img 
                src={foaLogo} 
                alt="FOA" 
                className="h-6 w-6 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent text-sidebar-foreground"
            title={isCollapsed ? "Abrir menu" : "Fechar menu"}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 sm:px-2">
        <SidebarMenu>
          {/* Dashboard Geral */}
          {dashboardItem && (
            <SidebarMenuItem key={dashboardItem.path}>
              <SidebarMenuButton
                asChild
                isActive={currentPath === dashboardItem.path}
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3"
              >
                <NavLink
                  to={dashboardItem.path}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm"
                  onClick={handleNavClick}
                >
                  <dashboardItem.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">{dashboardItem.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Projetos/Obras */}
          {projetosItem && (
            <SidebarMenuItem key={projetosItem.path}>
              <SidebarMenuButton
                asChild
                isActive={currentPath === projetosItem.path}
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3"
              >
                <NavLink
                  to={projetosItem.path}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm"
                  onClick={handleNavClick}
                >
                  <projetosItem.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">{projetosItem.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {filteredFinancasItems.length > 0 && (
            <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentPath === "/financas"}
                  className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3"
                  onClick={(e) => {
                    setFinancasOpen(!financasOpen);
                  }}
                >
                  <NavLink
                    to="/financas"
                    className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm w-full"
                    onClick={handleNavClick}
                  >
                    <Banknote className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    {!isCollapsed && <span className="flex-1 truncate">Finanças</span>}
                    {!isCollapsed && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          financasOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CollapsibleContent>
                {filteredFinancasItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPath === item.path}
                      className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3 pl-8"
                    >
                      <NavLink
                        to={item.path}
                        className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm"
                        onClick={handleNavClick}
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Contas Fornecedores */}
          {showContasFornecedores && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === contasFornecedoresItem.path}
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3"
              >
                <NavLink
                  to={contasFornecedoresItem.path}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm"
                  onClick={handleNavClick}
                >
                  <contasFornecedoresItem.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">{contasFornecedoresItem.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Remaining items (Armazém, RH & Ponto, Segurança & Higiene, Tarefas) */}
          {remainingItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={currentPath === item.path}
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3"
              >
                <NavLink
                  to={item.path}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm"
                  onClick={handleNavClick}
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {isDirector() && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === "/usuarios"}
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground min-h-[40px] sm:min-h-[48px] px-2 sm:px-3"
              >
                <NavLink
                  to="/usuarios"
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 text-xs sm:text-sm"
                  onClick={handleNavClick}
                >
                  <UserCog className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">Gestão de Usuários</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {profile && (
          <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
            <Separator className="bg-sidebar-foreground/20" />
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Sair
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
