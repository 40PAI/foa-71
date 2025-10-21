import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientesKPICards } from "./ClientesKPICards";
import { FornecedoresKPICards } from "./FornecedoresKPICards";
import { ClientesTable } from "./ClientesTable";
import { FornecedoresTable } from "./FornecedoresTable";
import { ClienteModal } from "@/components/modals/ClienteModal";
import { ViewClienteModal } from "@/components/modals/ViewClienteModal";
import { FornecedorModal } from "@/components/modals/FornecedorModal";
import { ViewFornecedorModal } from "@/components/modals/ViewFornecedorModal";
import { Users, Truck } from "lucide-react";
import type { Cliente } from "@/types/contasCorrentes";

interface ContasCorrentesSectionProps {
  projectId?: number;
  mode?: 'both' | 'clientes' | 'fornecedores';
}

export function ContasCorrentesSection({ projectId, mode = 'both' }: ContasCorrentesSectionProps) {
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | undefined>();
  const [viewClienteModalOpen, setViewClienteModalOpen] = useState(false);
  const [clienteToView, setClienteToView] = useState<Cliente | undefined>();
  
  // Fornecedores modals state
  const [fornecedorModalOpen, setFornecedorModalOpen] = useState(false);
  const [fornecedorToEdit, setFornecedorToEdit] = useState<any>();
  const [viewFornecedorModalOpen, setViewFornecedorModalOpen] = useState(false);
  const [fornecedorToView, setFornecedorToView] = useState<any>();

  // Render only clientes if mode is 'clientes'
  if (mode === 'clientes') {
    return (
      <>
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
      </>
    );
  }

  // Render only fornecedores if mode is 'fornecedores'
  if (mode === 'fornecedores') {
    return (
      <>
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
      </>
    );
  }

  // Default: Render both with tabs
  return (
    <>
      <Tabs defaultValue="clientes" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="clientes" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Clientes
        </TabsTrigger>
        <TabsTrigger value="fornecedores" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Fornecedores
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
    </>
  );
}
