
# Plano: Gráfico de Fluxo de Caixa Profissional e Informativo

## Problema Identificado

O gráfico actual de Fluxo de Caixa utiliza curvas `monotone` (suavizadas) que podem parecer "inventadas" e não reflectem claramente os picos e quedas reais dos dados. O utilizador pretende:
- Visualização mais precisa dos dados reais
- Cores profissionais e coerentes (verde para entradas, vermelho para saídas)
- Marcadores de dados nos picos importantes
- Informações adicionais como variação mensal e picos máximos
- Visual mais refinado e corporativo

## Solução Proposta

Refactorizar o `CashFlowAreaChart` para ser mais profissional e informativo, utilizando:

### Melhorias Visuais

| Elemento | Actual | Proposto |
|----------|--------|----------|
| Tipo de curva | `monotone` (curva suave) | `linear` (ligação recta entre pontos) |
| Marcadores | Nenhum | Pontos nos picos/máximos |
| Opacidade do preenchimento | 0.8 → 0.1 | 0.6 → 0.15 (mais suave) |
| Legenda | Simples | Com ícones e valores totais |
| Tooltip | Básico | Detalhado com variação % |
| Grid | Tracejado simples | Grid mais discreto |
| Cores | HSL hardcoded | Variáveis CSS do design system |

### Novas Funcionalidades Informativas

1. **Marcadores de Pico**: Círculos maiores nos pontos de máximo de entradas e saídas
2. **Linha de Saldo**: Linha tracejada mostrando o saldo acumulado ao longo do tempo
3. **Área de Referência**: Indicador visual quando o saldo fica negativo
4. **Variação Mensal**: No tooltip, mostrar a variação % em relação ao mês anterior
5. **Estatísticas no Header**: Pico máximo de entradas/saídas, média mensal, tendência

### Diagrama da Nova Estrutura

```text
┌─────────────────────────────────────────────────────────────────┐
│ ↗ Fluxo de Caixa do Projecto                                   │
│ Últimos 12 meses de movimentações                   [Expandir] │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                       │
│ │↗ 23.3M Kz │ │↘ 59.4M Kz │ │📊 Pico:   │                      │
│ │ Entradas  │ │ Saídas    │ │ Jun 22.5M │                      │
│ └───────────┘ └───────────┘ └───────────┘                       │
│                                                                 │
│    24M ─┬─────────────────────────────────────────────────────  │
│         │      ●  (pico máx)                                    │
│    18M ─┤     ╱ ╲                                               │
│         │    ╱   ╲      ● (pico)                                │
│    12M ─┤   ╱     ╲    ╱ ╲                                      │
│         │  ╱       ╲  ╱   ╲                                     │
│     6M ─┤ ╱         ╲╱     ╲                                    │
│         │╱                  ╲────────────                       │
│     0M ─┼─────────────────────────────────────────────────────  │
│         │  mar  abr  mai  jun  jul  ago  set  out  nov  dez     │
│         │                                                       │
│         │     ── Entradas (verde)   ── Saídas (vermelho)        │
│         │     ── Saldo Acumulado (azul tracejado)               │
├─────────────────────────────────────────────────────────────────┤
│ Saldo acumulado:                         -36.069.676,01 Kz      │
│ (vermelho se negativo, verde se positivo)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Ficheiro a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/charts/CashFlowAreaChart.tsx` | Refactorar completamente para design profissional |

## Detalhes Técnicos

### 1. Curva Linear em Vez de Monotone

```typescript
// ANTES
<Area type="monotone" ... />

// DEPOIS
<Area type="linear" ... />
```

A curva `monotone` cria interpolação suave que pode distorcer os dados reais. Com `linear`, cada ponto é ligado directamente, mostrando os picos e quedas reais.

### 2. Marcadores nos Pontos de Dados

```typescript
<Area
  type="linear"
  dot={{ r: 4, fill: 'hsl(142, 76%, 36%)' }}
  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
/>
```

### 3. Linha de Saldo Acumulado

```typescript
<Line
  type="linear"
  dataKey="saldo"
  stroke="hsl(217, 91%, 60%)"
  strokeWidth={2}
  strokeDasharray="6 3"
  dot={false}
  name="Saldo Acumulado"
/>
```

### 4. Área de Referência para Saldo Negativo

```typescript
<ReferenceArea
  y1={0}
  y2={minSaldo < 0 ? minSaldo : 0}
  fill="hsl(0, 84%, 60%)"
  fillOpacity={0.1}
/>
```

### 5. Tooltip Detalhado com Variação

```typescript
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const current = payload[0].payload;
    const prevIndex = data.findIndex(d => d.mes === label) - 1;
    const prev = prevIndex >= 0 ? data[prevIndex] : null;
    
    const variacaoEntradas = prev ? 
      ((current.entradas - prev.entradas) / prev.entradas * 100) : 0;
    const variacaoSaidas = prev ?
      ((current.saidas - prev.saidas) / prev.saidas * 100) : 0;
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold">{label}</p>
        <p className="text-green-600">
          Entradas: {formatCurrency(current.entradas)}
          {prev && <span className="text-xs ml-1">
            ({variacaoEntradas > 0 ? '+' : ''}{variacaoEntradas.toFixed(0)}%)
          </span>}
        </p>
        <p className="text-red-600">
          Saídas: {formatCurrency(current.saidas)}
        </p>
        <p className={current.saldo >= 0 ? "text-blue-600" : "text-red-600"}>
          Saldo: {formatCurrency(current.saldo)}
        </p>
      </div>
    );
  }
  return null;
};
```

### 6. Estatísticas de Pico no Header

```typescript
// Calcular picos
const maxEntradas = Math.max(...data.map(d => d.entradas));
const maxSaidas = Math.max(...data.map(d => d.saidas));
const mesPicoEntradas = data.find(d => d.entradas === maxEntradas)?.mes;
const mesPicoSaidas = data.find(d => d.saidas === maxSaidas)?.mes;
```

### 7. Gradientes Mais Suaves

```typescript
<linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="hsl(142, 76%, 40%)" stopOpacity={0.6} />
  <stop offset="50%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3} />
  <stop offset="100%" stopColor="hsl(142, 76%, 50%)" stopOpacity={0.05} />
</linearGradient>
```

## Resultado Esperado

1. **Visualização Precisa**: Curvas lineares mostram exactamente onde ocorreram picos e quedas
2. **Informação Rica**: Tooltip com variações, badges com picos máximos
3. **Visual Profissional**: Gradientes suaves, marcadores de dados, cores coerentes
4. **Linha de Saldo**: Tracejado mostrando evolução do saldo acumulado
5. **Destaque de Negativo**: Área vermelha suave quando o saldo fica negativo

## Impacto

- Afecta todos os locais onde `CashFlowAreaChart` é utilizado
- Mantém a mesma API (props), sem necessidade de alterar componentes consumidores
- Melhoria puramente visual e informativa
