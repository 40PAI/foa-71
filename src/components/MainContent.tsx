
import { Routes, Route } from "react-router-dom";
import { DashboardGeralPage } from "@/pages/DashboardGeralPage";
import { ProjetosPage } from "@/pages/ProjetosPage";
import { FinancasPage } from "@/pages/FinancasPage";
import CentrosCustoPage from "@/pages/CentrosCustoPage";
import ContasFornecedoresPage from "@/pages/ContasFornecedoresPage";
import GastosObraPage from "@/pages/GastosObraPage";
import { ComprasPage } from "@/pages/ComprasPage";
import { ArmazemPage } from "@/pages/ArmazemPage";
import RhPage from "@/pages/RhPage";
import { SegurancaPage } from "@/pages/SegurancaPage";
import { TarefasPage } from "@/pages/TarefasPage";
import { GraficosPage } from "@/pages/GraficosPage";
import { UserManagementPage } from "@/pages/UserManagementPage";
import { DividaFOAPage } from "@/pages/DividaFOAPage";
import { useSidebar } from "@/components/ui/sidebar";

export function MainContent() {
  const { open: sidebarOpen } = useSidebar();
  
  return (
    <main className="flex-1 min-w-0 w-full overflow-x-hidden">
      <div className="h-full overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardGeralPage />} />
          <Route path="/projetos" element={<ProjetosPage />} />
          <Route path="/financas" element={<FinancasPage />} />
          <Route path="/centros-custo" element={<CentrosCustoPage />} />
          <Route path="/contas-fornecedores" element={<ContasFornecedoresPage />} />
          <Route path="/gastos-obra" element={<GastosObraPage />} />
          <Route path="/divida-foa-fof" element={<DividaFOAPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/armazem" element={<ArmazemPage />} />
          <Route path="/rh" element={<RhPage />} />
          <Route path="/seguranca" element={<SegurancaPage />} />
          <Route path="/tarefas" element={<TarefasPage />} />
          <Route path="/graficos" element={<GraficosPage />} />
          <Route path="/usuarios" element={<UserManagementPage />} />
        </Routes>
      </div>
    </main>
  );
}
