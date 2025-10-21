import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientesKPICards } from "./ClientesKPICards";
import { FornecedoresKPICards } from "./FornecedoresKPICards";
import { ClientesTable } from "./ClientesTable";
import { FornecedoresTable } from "./FornecedoresTable";
import { ContratosClientesTable } from "./ContratosClientesTable";
import { ContratosFornecedoresTable } from "./ContratosFornecedoresTable";
import { PagamentosRecebimentosTable } from "./PagamentosRecebimentosTable";
import { ClienteModal } from "@/components/modals/ClienteModal";
import { ViewClienteModal } from "@/components/modals/ViewClienteModal";
import { ContratoClienteModal } from "@/components/modals/ContratoClienteModal";
import { FornecedorModal } from "@/components/modals/FornecedorModal";
import { ViewFornecedorModal } from "@/components/modals/ViewFornecedorModal";
import { ContratoFornecedorModal } from "@/components/modals/ContratoFornecedorModal";
import { Users, Truck, Receipt } from "lucide-react";
import type { Cliente } from "@/types/contasCorrentes";

interface ContasCorrentesSectionProps {
  projectId?: number;
}

export function ContasCorrentesSection({ projectId }: ContasCorrentesSectionProps) {
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | undefined>();
  const [viewClienteModalOpen, setViewClienteModalOpen] = useState(false);
  const [clienteToView, setClienteToView] = useState<Cliente | undefined>();
  const [contratoClienteModalOpen, setContratoClienteModalOpen] = useState(false);
  const [contratoClienteToEdit, setContratoClienteToEdit] = useState<any>();
  
  // Fornecedores modals state
  const [fornecedorModalOpen, setFornecedorModalOpen] = useState(false);
  const [fornecedorToEdit, setFornecedorToEdit] = useState<any>();
  const [viewFornecedorModalOpen, setViewFornecedorModalOpen] = useState(false);
  const [fornecedorToView, setFornecedorToView] = useState<any>();
  const [contratoFornecedorModalOpen, setContratoFornecedorModalOpen] = useState(false);
  const [contratoFornecedorToEdit, setContratoFornecedorToEdit] = useState<any>();

  return (
    <>
      <Tabs defaultValue="clientes" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="clientes" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Clientes
        </TabsTrigger>
        <TabsTrigger value="fornecedores" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Fornecedores
        </TabsTrigger>
        <TabsTrigger value="transacoes" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Transações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clientes" className="space-y-4">
        <ClientesKPICards projectId={projectId} />
        <ClientesTable
          projectId={projectId}
          onAdd={() => {
            setClienteToEdit(undefined);
            setClienteModalOpen(true);
          }}
          onEdit={(cliente) => {
            setClienteToEdit(cliente);
            setClienteModalOpen(true);
          }}
          onView={(cliente) => {
            setClienteToView(cliente);
            setViewClienteModalOpen(true);
          }}
        />
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-4">Contratos de Clientes</h3>
          <ContratosClientesTable
            projectId={projectId}
            onAdd={() => {
              setContratoClienteToEdit(undefined);
              setContratoClienteModalOpen(true);
            }}
            onEdit={(contrato) => {
              setContratoClienteToEdit(contrato);
              setContratoClienteModalOpen(true);
            }}
            onRegistrarRecebimento={() => alert("Modal de recebimento em desenvolvimento")}
          />
        </div>
      </TabsContent>

      <TabsContent value="fornecedores" className="space-y-4">
        <FornecedoresKPICards projectId={projectId} />
        <FornecedoresTable
          projectId={projectId}
          onAdd={() => {
            setFornecedorToEdit(undefined);
            setFornecedorModalOpen(true);
          }}
          onEdit={(fornecedor) => {
            setFornecedorToEdit(fornecedor);
            setFornecedorModalOpen(true);
          }}
          onView={(fornecedor) => {
            setFornecedorToView(fornecedor);
            setViewFornecedorModalOpen(true);
          }}
        />
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-4">Contratos de Fornecedores</h3>
          <ContratosFornecedoresTable
            projectId={projectId}
            onAdd={() => {
              setContratoFornecedorToEdit(undefined);
              setContratoFornecedorModalOpen(true);
            }}
            onEdit={(contrato) => {
              setContratoFornecedorToEdit(contrato);
              setContratoFornecedorModalOpen(true);
            }}
            onRegistrarPagamento={(contrato) => alert(`Registrar pagamento: ${contrato.id}`)}
          />
        </div>
      </TabsContent>

      <TabsContent value="transacoes" className="space-y-4">
        <PagamentosRecebimentosTable
          projectId={projectId}
          onEdit={() => alert("Modal de edição em desenvolvimento")}
        />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClienteModal
        open={clienteModalOpen}
        onOpenChange={setClienteModalOpen}
        cliente={clienteToEdit}
        projectId={projectId}
      />
      <ViewClienteModal
        open={viewClienteModalOpen}
        onOpenChange={setViewClienteModalOpen}
        cliente={clienteToView}
      />
      <ContratoClienteModal
        open={contratoClienteModalOpen}
        onOpenChange={setContratoClienteModalOpen}
        contrato={contratoClienteToEdit}
        projectId={projectId}
      />

      {/* Fornecedores Modals */}
      <FornecedorModal
        open={fornecedorModalOpen}
        onOpenChange={setFornecedorModalOpen}
        fornecedor={fornecedorToEdit}
      />
      
      <ViewFornecedorModal
        open={viewFornecedorModalOpen}
        onOpenChange={setViewFornecedorModalOpen}
        fornecedor={fornecedorToView}
      />

      <ContratoFornecedorModal
        open={contratoFornecedorModalOpen}
        onOpenChange={setContratoFornecedorModalOpen}
        contrato={contratoFornecedorToEdit}
        projectId={projectId}
      />
    </>
  );
}
