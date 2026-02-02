

# Plano: Melhorar Sistema de Notificações - Descrições Detalhadas e Acções Funcionais

## Problemas Identificados

### 1. Notificações Vagas
O toast actual mostra apenas:
- **Título**: "8 material(s) com stock crítico"
- **Descrição**: "Verifique os materiais com menos de 10 unidades em stock."

Não especifica **quais materiais**, **quantas unidades têm**, nem **que acção tomar**.

### 2. Botão "Ver Detalhes" Não Funciona
Quando o utilizador clica no botão, a página recarrega e nada acontece visualmente porque:
- Usa `window.location.href = '/armazem?filter=critical'` que causa reload
- Se já está em `/armazem`, o reload apaga o estado do filtro antes de ser aplicado

## Solução Proposta

### Parte 1: Notificações Mais Descritivas

Melhorar as mensagens do toast para incluir informação actionable:

**Toast Actual:**
```
⚠️ 8 material(s) com stock crítico
   Verifique os materiais com menos de 10 unidades em stock.
   [Ver detalhes]
```

**Toast Melhorado:**
```
⚠️ Stock Crítico - Acção Necessária
   
   📦 3 materiais urgentes (0 unidades):
   • Pedreiro (MOB-031)
   • Pedreiro (MOB-041)
   • Pedreiro (MOB-001)
   
   ⚠️ 5 materiais em alerta (< 10 unidades):
   • Betoneira 400L (2 un.)
   • Portão metálico 3x2m (2 un.)
   • Janelas de Caixilharia (6 un.)
   ...
   
   [Encomendar Agora] [Ver Lista Completa]
```

### Parte 2: Navegação com React Router

Substituir `window.location.href` por navegação do React Router para evitar reloads:

```typescript
// ANTES
onClick: () => {
  window.location.href = '/armazem?filter=critical';
}

// DEPOIS - usar navigate do React Router
// Ou criar evento customizado que o ArmazemPage escuta
onClick: () => {
  // Se já está em /armazem, despacha evento para activar filtro
  if (window.location.pathname === '/armazem') {
    window.dispatchEvent(new CustomEvent('activate-critical-filter'));
  } else {
    // Navegar para /armazem com parâmetro
    window.location.href = '/armazem?filter=critical';
  }
}
```

## Implementação Técnica

### Ficheiro 1: `src/hooks/useCriticalStock.ts`

Alterar a função `checkAndAlert` para:

1. **Separar materiais por urgência** (0 unidades vs < 10 unidades)
2. **Listar materiais específicos** no corpo do toast
3. **Usar CustomEvent** para comunicar com ArmazemPage quando já está na página

```typescript
// Organizar materiais por urgência
const urgentItems = criticalItems.filter(i => i.stock_atual === 0);
const warningItems = criticalItems.filter(i => i.stock_atual > 0 && i.stock_atual < 10);

// Construir descrição detalhada
let description = '';
if (urgentItems.length > 0) {
  description += `🔴 ${urgentItems.length} em ruptura: ${urgentItems.slice(0, 3).map(i => i.nome).join(', ')}`;
  if (urgentItems.length > 3) description += ` e +${urgentItems.length - 3} mais`;
  description += '\n';
}
if (warningItems.length > 0) {
  description += `⚠️ ${warningItems.length} em alerta: ${warningItems.slice(0, 3).map(i => `${i.nome} (${i.stock_atual} un.)`).join(', ')}`;
  if (warningItems.length > 3) description += ` e +${warningItems.length - 3} mais`;
}

toast.warning('Stock Crítico - Acção Necessária', {
  description: description,
  duration: 15000, // Mais tempo para ler
  action: {
    label: 'Ver detalhes',
    onClick: () => {
      if (window.location.pathname === '/armazem') {
        // Despachar evento para activar filtro sem reload
        window.dispatchEvent(new CustomEvent('activate-critical-filter'));
      } else {
        window.location.href = '/armazem?filter=critical';
      }
    }
  }
});
```

### Ficheiro 2: `src/pages/ArmazemPage.tsx`

Adicionar listener para o CustomEvent:

```typescript
// Escutar evento para activar filtro (quando já está na página)
useEffect(() => {
  const handleActivateFilter = () => {
    setShowCriticalOnly(true);
    // Scroll para o topo da tabela de materiais
    document.querySelector('[data-materials-table]')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.addEventListener('activate-critical-filter', handleActivateFilter);
  
  return () => {
    window.removeEventListener('activate-critical-filter', handleActivateFilter);
  };
}, []);
```

### Ficheiro 3: Melhorar Notificações no Painel (Opcional)

No `NotificationPanel.tsx`, melhorar a apresentação:

```typescript
// Mostrar mais detalhes na notificação
<p className="text-xs text-muted-foreground mt-0.5">
  {notification.mensagem}
</p>

// Se for stock crítico, mostrar lista de materiais
{notification.tipo === 'stock_critico' && notification.entidade_tipo === 'material' && (
  <div className="mt-2 text-xs">
    <span className="text-red-500 font-medium">Acção sugerida:</span>
    <span> Verificar fornecedor e criar requisição de compra</span>
  </div>
)}
```

## Resumo das Alterações

| Ficheiro | Alteração |
|----------|-----------|
| `src/hooks/useCriticalStock.ts` | Toast com descrição detalhada dos materiais, acção com CustomEvent |
| `src/pages/ArmazemPage.tsx` | Listener para CustomEvent que activa filtro sem reload |

## Resultado Esperado

1. **Toast mostra informação útil**: Quais materiais, quantas unidades, urgência
2. **Botão "Ver detalhes" funciona**: Activa filtro de stock crítico mesmo quando já está na página
3. **Experiência fluida**: Sem reloads desnecessários, scroll automático para a tabela
4. **Acções claras**: Utilizador sabe exactamente o que precisa fazer

