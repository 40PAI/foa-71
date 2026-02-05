import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

// Lazy load todas as páginas para reduzir bundle inicial
const DashboardGeralPage = lazy(() => import("@/pages/DashboardGeralPage").then(m => ({ default: m.DashboardGeralPage })));
const ProjetosPage = lazy(() => import("@/pages/ProjetosPage").then(m => ({ default: m.ProjetosPage })));
const FinancasPage = lazy(() => import("@/pages/FinancasPage").then(m => ({ default: m.FinancasPage })));
const CentrosCustoPage = lazy(() => import("@/pages/CentrosCustoPage"));
const ContasFornecedoresPage = lazy(() => import("@/pages/ContasFornecedoresPage"));
const GastosObraPage = lazy(() => import("@/pages/GastosObraPage"));
const ComprasPage = lazy(() => import("@/pages/ComprasPage").then(m => ({ default: m.ComprasPage })));
const ArmazemPage = lazy(() => import("@/pages/ArmazemPage").then(m => ({ default: m.ArmazemPage })));
const RhPage = lazy(() => import("@/pages/RhPage"));
const SegurancaPage = lazy(() => import("@/pages/SegurancaPage").then(m => ({ default: m.SegurancaPage })));
const TarefasPage = lazy(() => import("@/pages/TarefasPage").then(m => ({ default: m.TarefasPage })));
const GraficosPage = lazy(() => import("@/pages/GraficosPage").then(m => ({ default: m.GraficosPage })));
const UserManagementPage = lazy(() => import("@/pages/UserManagementPage").then(m => ({ default: m.UserManagementPage })));
const DividaFOAPage = lazy(() => import("@/pages/DividaFOAPage").then(m => ({ default: m.DividaFOAPage })));

// Fallback minimalista - quase invisível para transições rápidas
const MinimalFallback = () => (
  <div className="flex-1 min-h-0" />
);

export function MainContent() {
  const { open: sidebarOpen } = useSidebar();
  
  return (
    <main className="flex-1 min-w-0 w-full">
      <div className="h-full">
        <Suspense fallback={<MinimalFallback />}>
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
        </Suspense>
      </div>
    </main>
  );
}
