# Arquitetura do Projeto

## 📚 Documentação Relacionada

- [Performance & Otimização](./PERFORMANCE_OPTIMIZATION.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Integração Financeira](./FINANCIAL_INTEGRATION.md)

## 🏗️ Princípios Arquiteturais Fundamentais

1. **Separação de Responsabilidades**: Lógica de negócio isolada em services, UI em componentes
2. **Domain-Driven Design**: Código organizado por domínios de negócio (financeiro, projetos, tarefas)
3. **Type Safety**: TypeScript completo para todas as estruturas de dados
4. **Performance First**: Queries otimizadas, memoization e lazy loading
5. **Maintainability**: Estrutura clara, documentação e barrel exports

## 📁 Estrutura de Diretórios

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes UI (shadcn)
│   │   └── index.ts    # ✨ Barrel export para todos os componentes UI
│   ├── financial/      # ✨ Componentes financeiros
│   │   ├── FinancialOverview.tsx
│   │   ├── CategoryBreakdown.tsx
│   │   ├── DetailedBreakdown.tsx
│   │   └── index.ts
│   ├── shared/         # Componentes compartilhados
│   ├── domain/         # Componentes específicos por domínio
│   ├── forms/          # Formulários
│   ├── modals/         # Modais
│   ├── charts/         # Gráficos
│   ├── calendars/      # Calendários
│   └── layout/         # Layouts
│
├── services/           # ✨ Lógica de negócio (NOVO)
│   └── financial/      # Serviços financeiros
│       ├── calculations.ts    # Funções de cálculo puras
│       ├── integration.ts     # Lógica de integração
│       └── index.ts
│
├── contexts/           # React Contexts
│   ├── index.ts        # Barrel export de todos os contexts
│   └── AllProviders.tsx # Provedor combinado
│
├── hooks/              # Custom React Hooks
│   ├── index.ts        # ✨ Barrel export (sistema consolidado)
│   ├── financial/      # ✨ Hooks financeiros (NOVO)
│   │   └── index.ts
│   ├── useQuery.ts     # Sistema de queries otimizado
│   ├── useContextHooks.ts # Hooks de contextos otimizados
│   └── useMemoizedCallback.ts # Utilitários de performance
│
├── types/              # TypeScript Types (REORGANIZADO)
│   ├── index.ts        # Barrel export de todos os tipos
│   ├── project.ts      # ✨ Tipos de projeto
│   ├── finance.ts      # ✨ Tipos financeiros
│   ├── employee.ts     # ✨ Tipos de RH/colaboradores
│   ├── warehouse.ts    # ✨ Tipos de armazém/materiais
│   ├── requisition.ts  # ✨ Tipos de requisições
│   ├── task.ts         # ✨ Tipos de tarefas/LEAN
│   ├── safety.ts       # ✨ Tipos de segurança
│   ├── patrimony.ts    # ✨ Tipos de patrimônio
│   └── dashboard.ts    # ✨ Tipos de dashboards/KPIs
│
├── lib/                # Bibliotecas e utilidades (EXPANDIDO)
│   ├── utils.ts        # Utilitário principal (re-export)
│   ├── helpers.ts      # ✨ Funções auxiliares
│   ├── constants.ts    # ✨ Constantes da aplicação
│   ├── logger.ts       # Sistema de logs
│   └── performance-monitor.ts # Monitor de performance
│
├── utils/             # Utilitários de formatação
│   └── formatters.ts  # ✨ Formatações expandidas
│
├── pages/              # Páginas da aplicação
├── integrations/       # Integrações externas (Supabase)
└── styles/            # Estilos globais

✨ = Novo ou melhorado na refatoração recente
```

## 🏗️ Princípios Arquiteturais

### 1. **Separação de Responsabilidades**
- Cada módulo tem uma responsabilidade única e bem definida
- Componentes separados por domínio de negócio
- Hooks organizados por funcionalidade

### 2. **Barrel Exports**
- Todos os módulos principais têm `index.ts` para exports centralizados
- Facilita imports: `import { Button, Card } from "@/components/ui"`
- Reduz complexidade de paths

### 3. **Tipos Organizados por Domínio**
```typescript
// Antes (tudo em um arquivo)
import { Project, Finance, Employee } from "@/types"

// Agora (organizado por domínio)
import { Project } from "@/types/project"
import { Finance } from "@/types/finance"
import { Employee } from "@/types/employee"

// Ou usar o barrel export
import { Project, Finance, Employee } from "@/types"
```

### 4. **Sistema de Query Unificado**
```typescript
// Hook otimizado com cache configurável
import { useOptimizedQuery } from "@/hooks/useQuery"

const { data } = useOptimizedQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  cacheProfile: 'standard', // ou 'financial', 'realtime', 'static'
  projectSpecific: true
})
```

### 5. **Constantes Centralizadas**
```typescript
import { QUERY_KEYS, CACHE_DURATION, USER_ROLES } from "@/lib/constants"

// Usar chaves padronizadas
queryKey: QUERY_KEYS.PROJECT_DETAILS(projectId)
```

### 6. **Helpers Reutilizáveis**
```typescript
import { formatCurrency, formatDate, calculatePercentage } from "@/lib/helpers"

const formattedValue = formatCurrency(1000000) // "1.000.000,00 AOA"
const formattedDate = formatDate(new Date()) // "15/01/2025"
const percentage = calculatePercentage(50, 200) // 25
```

## 📊 Domínios de Negócio

### 1. **Projetos** (`project.ts`)
- Gestão de projetos de construção
- Etapas, status, métricas

### 2. **Finanças** (`finance.ts`)
- Orçamento vs realizado
- Breakdown financeiro
- Discrepâncias

### 3. **RH** (`employee.ts`)
- Colaboradores
- Alocações
- Ponto diário

### 4. **Armazém** (`warehouse.ts`)
- Materiais
- Movimentações
- Guias de consumo

### 5. **Compras** (`requisition.ts`)
- Requisições
- Aprovações
- Subcategorias

### 6. **Tarefas** (`task.ts`)
- LEAN construction
- PPC (Percentage Plan Complete)
- Semanas de projeto

### 7. **Segurança** (`safety.ts`)
- Incidentes
- EPIs
- Fichas técnicas

### 8. **Patrimônio** (`patrimony.ts`)
- Equipamentos
- Alocações

### 9. **Dashboards** (`dashboard.ts`)
- KPIs consolidados
- Analytics gerenciais

## 🔄 Fluxo de Dados

```
User Interaction
      ↓
   Component
      ↓
  Custom Hook (useQuery)
      ↓
React Query Cache ←→ Supabase API
      ↓
   Component
      ↓
     UI Update
```

## 🎯 Boas Práticas

### Import Order
```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. External libraries
import { useQuery } from '@tanstack/react-query'

// 3. Internal components
import { Button, Card } from '@/components/ui'

// 4. Internal hooks
import { useOptimizedQuery } from '@/hooks'

// 5. Types
import { Project } from '@/types'

// 6. Utils and helpers
import { formatCurrency } from '@/lib/helpers'
```

### Component Structure
```typescript
// Types first
interface Props {
  projectId: number
}

// Component
export function ProjectCard({ projectId }: Props) {
  // Hooks
  const { data, isLoading } = useOptimizedQuery(...)
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => {...}
  
  // Effects
  useEffect(() => {...}, [])
  
  // Render helpers
  if (isLoading) return <Skeleton />
  
  // Main render
  return <Card>...</Card>
}
```

## 📝 Convenções de Nomenclatura

- **Componentes**: PascalCase (`ProjectCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useProjectDetails.ts`)
- **Types**: PascalCase (`Project`, `Finance`)
- **Funções**: camelCase (`formatCurrency`)
- **Constantes**: UPPER_SNAKE_CASE (`QUERY_KEYS`, `USER_ROLES`)
- **Arquivos de barrel export**: `index.ts`

## 🚀 Performance

- Queries com cache configurável por perfil
- Memoization de callbacks e valores
- Debounce/throttle para inputs
- Lazy loading de rotas (planejado)
- Virtual scrolling para listas grandes (planejado)

## 🔐 Segurança

- RLS (Row Level Security) no Supabase
- Validação de permissões por role
- Tipos seguros em todo o código
- Sanitização de inputs

## 🔗 Documentação Relacionada

- [Design System](./DESIGN_SYSTEM.md)
- [Integração Financeira](./FINANCIAL_INTEGRATION.md)
- [Migração de Código Legado](./LEGACY_CODE_MIGRATION.md)
- [Otimização de Performance](./PERFORMANCE_OPTIMIZATION.md)
- [Documentação do Supabase](https://supabase.io/docs)
