

# Plano: Adicionar Zoom Interactivo ao Gráfico de Evolução Temporal

## Problema Identificado

O gráfico "Evolução Temporal - Entradas, Saídas e Saldo" mostra demasiados pontos de dados quando há muitos movimentos financeiros, resultando em:
- Datas sobrepostas no eixo X
- Labels de valores aglomerados e ilegíveis
- Dificuldade em identificar valores exactos em datas específicas

## Solução: Componente Brush do Recharts

O Recharts já inclui um componente `Brush` que adiciona uma barra de navegação na parte inferior do gráfico, permitindo:
- **Seleccionar um intervalo de datas** arrastando as extremidades
- **Ver apenas os dados seleccionados** no gráfico principal
- **Navegar temporalmente** movendo a janela de selecção

```text
ANTES (gráfico congestionado):
┌────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ Valores: +24M +23M +21M +19M ...   │  ← Ilegível
│ 05/12 06/11 07/10 ... 08/01        │  ← Datas sobrepostas
└────────────────────────────────────┘

DEPOIS (com Brush - visão ampliada):
┌────────────────────────────────────┐
│     ▓       ▓       ▓       ▓      │
│   +24.9M  +23.8M  +22.1M  +19.8M   │  ← Valores claros
│   25/08   28/08   01/09   05/09    │  ← Datas legíveis
├────────────────────────────────────┤
│ ░░░░░░░░[▓▓▓▓▓▓]░░░░░░░░░░░░░░░░░ │  ← Brush (seleccionar período)
└────────────────────────────────────┘
        ↑         ↑
      Início     Fim do zoom
```

## Implementação Técnica

### Ficheiro a Modificar

`src/components/financial/GraficoLinhaMovimentos.tsx`

### Alterações

1. **Importar o componente Brush**:
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Brush } from "recharts";
```

2. **Adicionar Brush ao BarChart**:
```typescript
<BarChart data={dados} margin={{ top: 30, right: 30, left: 20, bottom: 50 }}>
  {/* ... componentes existentes ... */}
  
  <Brush 
    dataKey="data" 
    height={30} 
    stroke="hsl(var(--primary))"
    fill="hsl(var(--muted))"
    travellerWidth={10}
    startIndex={Math.max(0, dados.length - 15)}  // Mostrar últimos 15 pontos inicialmente
  />
</BarChart>
```

3. **Ajustar margem inferior** para acomodar o Brush:
```typescript
margin={{ top: 30, right: 30, left: 20, bottom: 50 }}
```

4. **Adicionar botão "Reset Zoom"** para voltar à vista completa:
```typescript
const [brushRange, setBrushRange] = useState<{startIndex?: number, endIndex?: number}>({});

<Button 
  variant="ghost" 
  size="sm"
  onClick={() => setBrushRange({})}
  className="text-xs"
>
  <ZoomOut className="h-3 w-3 mr-1" />
  Reset
</Button>
```

### Props do Componente Brush

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| `dataKey` | `"data"` | Campo usado para labels no Brush |
| `height` | `30` | Altura da barra de navegação |
| `stroke` | `hsl(var(--primary))` | Cor da borda dos travellers |
| `fill` | `hsl(var(--muted))` | Cor de fundo do Brush |
| `travellerWidth` | `10` | Largura das alças de arrasto |
| `startIndex` | calculado | Índice inicial da selecção |

### Comportamento Esperado

1. **Vista Inicial**: Gráfico mostra os últimos 15 movimentos (ou menos se não existirem tantos)
2. **Navegação**: Utilizador arrasta as extremidades do Brush para seleccionar período
3. **Zoom Automático**: Gráfico principal actualiza mostrando apenas o período seleccionado
4. **Labels Legíveis**: Com menos pontos visíveis, valores e datas ficam claros
5. **Reset**: Botão para voltar à vista completa

## Resultado Esperado

- Utilizador consegue fazer zoom arrastando as extremidades da barra de navegação
- Valores e datas ficam claramente visíveis quando ampliados
- Funcionalidade disponível tanto no card normal quanto no modal expandido
- Experiência intuitiva sem necessidade de instruções

