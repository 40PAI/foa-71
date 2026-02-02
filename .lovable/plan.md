
# Plano: Resolver Barras de Scroll Horizontais Duplicadas

## Diagnóstico

A análise revelou **múltiplas camadas de containers com overflow** que criam barras de scroll redundantes:

```text
ESTRUTURA ACTUAL (com problema):
┌─ main (overflow-x-hidden + overflow-y-auto) ─────────┐
│   ┌─ div (overflow-y-auto) ──────────────────────┐   │
│   │   ┌─ Card ─────────────────────────────────┐ │   │
│   │   │   ┌─ div (minWidth: 1200px) ─────────┐ │ │   │
│   │   │   │   ┌─ Table wrapper (overflow-auto)│ │ │   │  ← SCROLL #1
│   │   │   │   │   <table/>                    │ │ │   │
│   │   │   │   └────────────────────────────┘ │ │ │   │
│   │   │   └──────────────────────────────────┘ │ │   │
│   │   └──────────────────────────────────────────┘ │   │
│   └────────────────────────────────────────────────┘   │
└── SCROLL #2 (barra inferior da página) ──────────────────┘
```

### Ficheiros Afectados

| Ficheiro | Problema |
|----------|----------|
| `src/components/MainContent.tsx` | `overflow-x-hidden` no main bloqueia scroll horizontal normal |
| `src/components/ui/table.tsx` | `overflow-auto` sempre activo cria scroll interno |
| `src/components/common/DataTable.tsx` | `minWidth` força conteúdo largo |

## Solução

Simplificar a estrutura de overflow para que exista **apenas uma barra de scroll horizontal** controlada pelo componente Table:

```text
ESTRUTURA CORRIGIDA:
┌─ main (sem overflow-x) ──────────────────────────────┐
│   ┌─ Card (overflow-hidden) ───────────────────────┐ │
│   │   ┌─ Table wrapper (overflow-auto) ──────────┐ │ │  ← ÚNICO SCROLL
│   │   │   <table minWidth="1200px"/>             │ │ │
│   │   └──────────────────────────────────────────┘ │ │
│   └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Alterações Técnicas

### 1. MainContent.tsx

Remover `overflow-x-hidden` do main e simplificar estrutura:

```typescript
// ANTES
<main className="flex-1 min-w-0 w-full overflow-x-hidden">
  <div className="h-full overflow-y-auto">

// DEPOIS
<main className="flex-1 min-w-0 w-full">
  <div className="h-full">
```

### 2. DataTable.tsx

Envolver o conteúdo num container com `overflow-x-auto` correctamente posicionado e remover o `minWidth` inline que força largura:

```typescript
// ANTES
const content = (
  <div style={{ minWidth }} className="w-full">
    <Table scrollIndicators={false}>

// DEPOIS
const content = (
  <div className="w-full overflow-x-auto">
    <Table scrollIndicators={false} className={minWidth ? `min-w-[${minWidth}]` : ''}>
```

### 3. Card Component (quando usado com tabelas)

Adicionar `overflow-hidden` ao Card quando contém tabelas para evitar que o scroll escape:

```typescript
// CardContent com p-0 para tabelas
<CardContent className="p-0 overflow-hidden">
```

### 4. Table UI Component

Modificar para que o `overflow-auto` só seja aplicado quando necessário e não haja wrapper duplicado:

```typescript
// ANTES - wrapper sempre com overflow-auto
<div className={cn("w-full overflow-auto", ...)}>
  <table ... />
</div>

// DEPOIS - table define própria largura, container pai controla scroll
<div className="relative w-full">
  <table className={cn("w-full caption-bottom text-sm", className)} ... />
</div>
```

## Princípio Aplicado

**Uma única responsabilidade de scroll**: O `overflow-x-auto` deve existir apenas num nível - o container imediato da tabela no DataTable. Isto evita barras duplicadas e garante comportamento previsível.

## Resultado Esperado

- Apenas UMA barra de scroll horizontal quando o conteúdo excede a largura
- Scroll funciona suavemente sem duplicação
- Consistência em todas as páginas com tabelas
- Mantém a responsividade mobile existente
