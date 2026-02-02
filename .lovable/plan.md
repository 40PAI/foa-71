
# Plano: Valores Numéricos Sem Truncagem - Quebra de Linha Automática

## Problema Identificado
Os KPI Cards e componentes de valor utilizam a classe CSS `truncate` que:
- Corta valores longos com "..." (ex: "305.675.6...")
- Esconde informação financeira importante
- Afeta a legibilidade em dispositivos móveis

## Solução Proposta
Substituir `truncate` por `break-all` nos valores numéricos, permitindo que números grandes quebrem para a linha seguinte em vez de serem cortados.

### Comportamento Atual vs. Desejado

```text
ANTES (errado):          DEPOIS (correto):
┌─────────────┐          ┌─────────────┐
│ 305.675.6...│          │ 305.675.    │
│             │          │ 619,92 Kz   │
└─────────────┘          └─────────────┘
```

## Componentes a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/KPICard.tsx` | Substituir `truncate` por `break-all` no valor principal |
| `src/components/mobile/MobileKPIGrid.tsx` | Substituir `truncate` por `break-all` no valor |
| `src/components/layout/ResponsiveCard.tsx` | Substituir `truncate` por `break-all` no `ResponsiveKPICard` |
| `src/components/charts/SmartKPICard.tsx` | Garantir que `break-words` está a funcionar correctamente |
| `src/components/dashboard/DashboardFinancasSection.tsx` | Aplicar quebra de linha nos valores financeiros |

## Detalhes Técnicos

### Alteração CSS Principal
```typescript
// ANTES
className="text-sm sm:text-base lg:text-lg font-bold min-w-0 flex-1 truncate"

// DEPOIS  
className="text-sm sm:text-base lg:text-lg font-bold min-w-0 flex-1 break-all leading-tight"
```

### Propriedades CSS Relevantes
- `break-all`: Permite quebrar em qualquer caractere (ideal para números)
- `leading-tight`: Mantém as linhas próximas para valores que quebram
- Remove `truncate` que aplica `text-overflow: ellipsis`

### Casos Especiais
1. **Subtítulos**: Manter `truncate` pois são textos descritivos, não valores críticos
2. **Títulos**: Manter `truncate` pois são labels informativos
3. **Valores numéricos**: Aplicar `break-all` para mostrar sempre o número completo

## Resultado Esperado
- Valores financeiros grandes serão exibidos completos
- Números quebram naturalmente entre dígitos
- Melhora significativa na legibilidade mobile
- Nenhuma informação numérica importante será cortada com "..."
