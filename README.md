<<<<<<< HEAD
# Sistema de Gestão de Obras (Construction Management System)

Sistema completo de gestão de projetos de construção civil desenvolvido com React, TypeScript, e Supabase.

## 📚 Documentação

- [Arquitetura & Organização](./ARCHITECTURE.md)
- [Performance & Otimização](./PERFORMANCE_OPTIMIZATION.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Integração Financeira](./FINANCIAL_INTEGRATION.md)
- [Migração de Código Legado](./LEGACY_CODE_MIGRATION.md)

## 🚀 Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **State**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Charts**: Recharts

## 📦 Estrutura do Projeto

```
src/
├── services/           # Lógica de negócio isolada
├── hooks/             # React hooks customizados
├── components/        # Componentes React
├── types/             # TypeScript types por domínio
├── lib/               # Utilitários e helpers
├── pages/             # Páginas/rotas
└── contexts/          # Context providers
```

## 🏗️ Domínios do Sistema

### 1. Gestão Financeira
- Integração automática de gastos por categoria
- Detecção de discrepâncias
- Aprovações hierárquicas
- Controle orçamental

### 2. Gestão de Projetos
- Planejamento de etapas
- Acompanhamento de progresso físico
- Cálculo de PPC (Percent Plan Complete)
- Timeline e calendários

### 3. Gestão de Recursos Humanos
- Alocação de colaboradores
- Ponto diário
- Análises de produtividade
- Custos de mão de obra

### 4. Gestão de Compras
- Requisições de materiais
- Fluxo de aprovações
- Cotações e fornecedores
- Controle de estoque

### 5. Patrimônio
- Equipamentos e ferramentas
- Alocação por projeto
- Depreciação automática

### 6. Segurança
- Registro de incidentes
- Gestão de EPIs
- Análises de segurança

## 🎯 Funcionalidades Principais

- ✅ Dashboard executivo com KPIs em tempo real
- ✅ Gestão completa de projetos multi-etapa
- ✅ Integração financeira automática
- ✅ Sistema de aprovações hierárquicas
- ✅ Controle de estoque e armazém
- ✅ Análises e relatórios visuais
- ✅ Sincronização em tempo real
- ✅ Modo escuro/claro
- ✅ Responsivo (mobile-first)

## 🔐 Autenticação e Segurança

- Row-Level Security (RLS) no Supabase
- Controle de acesso por cargo
- Validação de limites orçamentais
- Auditoria de alterações

## 🎨 Design System

O projeto utiliza um design system completo baseado em tokens semânticos:

- **Cores**: Sistema HSL com variáveis CSS
- **Tipografia**: Escala modular consistente
- **Espaçamento**: Sistema de 4px
- **Componentes**: Variantes padronizadas
- **Animações**: Transições suaves

Ver [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) para detalhes.

## ⚡ Performance

O sistema foi otimizado para performance máxima:

- **Cache Estratégico**: React Query com diferentes perfis
- **Memoization**: Componentes e hooks otimizados
- **Lazy Loading**: Carregamento sob demanda
- **Debouncing**: Sincronização realtime otimizada
- **Code Splitting**: Bundles otimizados

Ver [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) para detalhes.

## 💰 Integração Financeira

A integração financeira é uma das features principais:

- **Cálculos Automáticos**: Baseado em requisições, RH e patrimônio
- **Reconciliação**: Compara valores calculados vs manuais
- **Detecção de Discrepâncias**: Alertas automáticos
- **Multi-fonte**: Consolida dados de múltiplas tabelas
- **Validação**: Consistência entre dados

Ver [FINANCIAL_INTEGRATION.md](./FINANCIAL_INTEGRATION.md) para arquitetura detalhada.

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

### Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Linting
```

## 📝 Padrões de Código

### Convenções

- **Componentes**: PascalCase (`FinancialOverview.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useFinances.ts`)
- **Services**: camelCase (`calculations.ts`)
- **Types**: PascalCase (`FinancialData`)
- **Constants**: SCREAMING_SNAKE_CASE (`CACHE_DURATION`)

### Organização de Imports

```typescript
// 1. External libraries
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal services/hooks
import { calculateFinancialProgress } from "@/services/financial";
import { useFinances } from "@/hooks/financial";

// 3. Components
import { Card } from "@/components/ui";

// 4. Types
import type { FinancialData } from "@/types/finance";

// 5. Utils
import { formatCurrency } from "@/utils/formatters";
```

### Barrel Exports

Todos os diretórios principais possuem `index.ts` para facilitar imports:

```typescript
// ❌ Evite
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ✅ Prefira
import { Button, Card, Badge } from "@/components/ui";
```

## 🤝 Contribuindo

1. Seguir os padrões de código estabelecidos
2. Documentar novas features
3. Adicionar types TypeScript
4. Escrever código performático
5. Manter consistência com o design system

## 📄 Licença

Este projeto é proprietário e confidencial.

---

## Project Info (Lovable)

**URL**: https://lovable.dev/projects/da228528-d665-47dc-8ad2-ae904f9a001e

### How to Edit

- **Use Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/da228528-d665-47dc-8ad2-ae904f9a001e)
- **Use your IDE**: Clone, edit locally, and push changes
- **GitHub**: Edit files directly in GitHub or use Codespaces

### Deployment

Simply open [Lovable](https://lovable.dev/projects/da228528-d665-47dc-8ad2-ae904f9a001e) and click on Share → Publish.

### Custom Domain

Navigate to Project > Settings > Domains and click Connect Domain. [Learn more](https://docs.lovable.dev/tips-tricks/custom-domain)
=======
# foa-71
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa
