
# Plano: Corrigir Botão "Ver Detalhes" na Notificação de Stock Crítico

## Problema Identificado

Quando o utilizador clica no botão "Ver detalhes" do toast de stock crítico, nada acontece porque:

1. **O utilizador já está na página `/armazem`** - o `window.location.href = '/armazem'` não muda nada visível
2. **Uso de `window.location.href`** em vez de navegação do React Router pode causar reload ou comportamento inesperado

## Solução Proposta

Em vez de simplesmente navegar para `/armazem`, implementar uma acção mais útil:

1. **Se já estiver em `/armazem`**: Filtrar automaticamente os materiais para mostrar apenas os com stock crítico
2. **Se estiver noutra página**: Navegar para `/armazem` com um parâmetro de query (`?filter=critical`) que activa o filtro

```text
FLUXO ACTUAL (não funciona):
┌─────────────────────────────────────┐
│ Toast: "8 materiais com stock crítico" │
│        [Ver detalhes]               │
└─────────────────────────────────────┘
         ↓ clica
window.location.href = '/armazem'
         ↓
(já está em /armazem → nada acontece)


FLUXO MELHORADO:
┌─────────────────────────────────────┐
│ Toast: "8 materiais com stock crítico" │
│        [Ver detalhes]               │
└─────────────────────────────────────┘
         ↓ clica
navigate('/armazem?filter=critical')
         ↓
ArmazemPage lê URL params
         ↓
Filtra tabela para stock < 10
         ↓
Utilizador vê materiais críticos!
```

## Alterações Técnicas

### 1. Ficheiro: `src/hooks/useCriticalStock.ts`

Modificar o handler do toast para:
- Usar `window.location.search` para detectar se já está em `/armazem`
- Navegar com query parameter `?filter=critical`

```typescript
// ANTES
onClick: () => {
  window.location.href = '/armazem';
}

// DEPOIS
onClick: () => {
  // Se já está em /armazem, apenas adiciona parâmetro de filtro
  if (window.location.pathname === '/armazem') {
    window.location.href = '/armazem?filter=critical';
  } else {
    window.location.href = '/armazem?filter=critical';
  }
}
```

### 2. Ficheiro: `src/pages/ArmazemPage.tsx`

Adicionar leitura dos parâmetros de URL e aplicar filtro automático:

```typescript
import { useSearchParams } from 'react-router-dom';

// No início do componente
const [searchParams, setSearchParams] = useSearchParams();

// Adicionar estado para filtro de stock crítico
const [showCriticalOnly, setShowCriticalOnly] = useState(false);

// useEffect para ler URL params
useEffect(() => {
  const filter = searchParams.get('filter');
  if (filter === 'critical') {
    setShowCriticalOnly(true);
    // Opcional: limpar o parâmetro da URL após aplicar
    searchParams.delete('filter');
    setSearchParams(searchParams, { replace: true });
  }
}, [searchParams]);

// Modificar filteredMaterials para incluir filtro crítico
const filteredMaterials = useMemo(() => {
  let filtered = materials || [];
  
  // Filtro de stock crítico
  if (showCriticalOnly) {
    filtered = filtered.filter(m => m.quantidade_stock < 10);
  }
  
  // Outros filtros existentes...
  return filtered.filter(material => {
    const matchesSearch = ...;
    const matchesStatus = ...;
    return matchesSearch && matchesStatus;
  });
}, [materials, searchTerm, filterStatus, showCriticalOnly]);
```

### 3. Adicionar Toggle Visual para Filtro Crítico

Na interface, adicionar um botão/badge que indica quando o filtro está activo:

```typescript
{/* Toggle para filtro de stock crítico */}
{showCriticalOnly && (
  <Badge 
    variant="destructive" 
    className="cursor-pointer"
    onClick={() => setShowCriticalOnly(false)}
  >
    <AlertTriangle className="h-3 w-3 mr-1" />
    Mostrando apenas stock crítico
    <X className="h-3 w-3 ml-1" />
  </Badge>
)}
```

## Alternativa Simplificada

Se preferir uma solução mais simples, podemos fazer o toast scroll para o banner de alerta de stock crítico que já existe na página:

```typescript
onClick: () => {
  if (window.location.pathname === '/armazem') {
    // Scroll para o banner de alerta (já na página)
    const alertBanner = document.querySelector('[data-critical-stock-banner]');
    alertBanner?.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = '/armazem?highlight=critical';
  }
}
```

## Resultado Esperado

| Localização Actual | Acção ao Clicar "Ver detalhes" |
|--------------------|--------------------------------|
| Qualquer página (não /armazem) | Navega para `/armazem?filter=critical` → Mostra só materiais críticos |
| Já em `/armazem` | Activa filtro de stock crítico → Tabela mostra só materiais < 10 unidades |
| Filtro já activo | Scroll para topo da tabela (já está a ver os dados) |

## Benefícios

- O botão "Ver detalhes" agora tem um efeito visível e útil
- Utilizador vê imediatamente os materiais que precisam de atenção
- Badge visual permite desactivar o filtro facilmente
- Funciona tanto se estiver noutra página como se já estiver em `/armazem`
