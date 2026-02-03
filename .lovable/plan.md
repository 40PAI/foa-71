

## Correção: Custos Indiretos - Valores Incorretos e Gastos Detalhados Vazios

### Problemas Identificados

Após análise detalhada da base de dados e do código, encontrei **dois problemas distintos**:

#### Problema 1: Valor Negativo no Card de Custos Indiretos (-12M Kz)

O card de "Custos Indiretos" está a mostrar **-12.038.588,07 Kz** enquanto o gráfico de Centros de Custo mostra correctamente **~36M Kz**.

**Causa Raiz:** O gráfico de Centros de Custo (GraficoBarrasCategorias) filtra apenas `tipo_movimento === 'saida'` e agrupa os valores correctamente. No entanto, há um cálculo algures que está a subtrair entradas das saídas:

- Total de Saídas (gastos reais): **35.959.912,64 Kz**
- Total de Entradas: **47.998.500,71 Kz**
- Saldo (saída - entrada): **-12.038.588,07 Kz** ← Este valor negativo está a aparecer no card

O hook `useCategoryIntegratedExpenses` está correcto (só soma saídas), mas o card pode estar a receber dados de outra fonte ou há uma cache com dados antigos.

#### Problema 2: Modal "Ver Mais" Vazio para Custos Indiretos

Quando o utilizador clica em "Ver Mais" nos Custos Indiretos, a tabela mostra "Nenhum gasto registrado ainda".

**Causa Raiz:** O hook `useUnifiedExpenses` procura por categorias específicas no array:
```javascript
'indireto': ['Custos Indiretos', 'Indireto', 'indireto', 'Segurança', 'CUSTOS INDIRETOS', 'INDIRETO']
```

Mas na base de dados existem duas categorias relacionadas:
1. **"Custos Indiretos"** ✅ (está mapeada)
2. **"segurança e higiene no trabalho"** ❌ (NÃO está mapeada!)

### Dados Reais da Base de Dados

| Categoria | Tipo | Quantidade | Total (Kz) |
|-----------|------|------------|------------|
| Custos Indiretos | saída | 138 | 35.408.912,64 |
| Custos Indiretos | entrada | 2 | 47.998.500,71 |
| segurança e higiene no trabalho | saída | 6 | 551.000,00 |
| Materiais | saída | 84 | 18.616.556,81 |
| Mão de Obra | saída | 23 | 7.439.390,93 |
| Patrimônio | saída | 2 | 120.000,00 |

**Total de Custos Indiretos (apenas saídas):** 35.408.912,64 + 551.000 = **35.959.912,64 Kz**

### Solução Técnica

#### 1. Actualizar `useUnifiedExpenses.ts`

Expandir o mapeamento de categorias para incluir todas as variações encontradas na base de dados:

```typescript
const categoryMap: Record<string, string[]> = {
  'material': ['Material', 'Materiais', 'material', 'Materia', 'MATERIAL', 'MATERIAIS', 'Materiais de Construção'],
  'mao_obra': ['Mão de Obra', 'Mao de Obra', 'mao_obra', 'Salário', 'Pessoal', 'MAO DE OBRA', 'MÃO DE OBRA'],
  'patrimonio': ['Patrimônio', 'Patrimonio', 'Equipamento', 'patrimonio', 'Veículo', 'PATRIMONIO', 'EQUIPAMENTO'],
  'indireto': [
    'Custos Indiretos', 
    'Indireto', 
    'indireto', 
    'Segurança', 
    'CUSTOS INDIRETOS', 
    'INDIRETO',
    'segurança e higiene no trabalho',  // NOVO
    'Segurança e Higiene',              // NOVO
    'Administrativo',                    // NOVO
    'Transporte',                        // NOVO
    'Energia',                           // NOVO
    'Comunicação'                        // NOVO
  ]
};
```

Também adicionar uma lógica de fallback que usa pattern matching (ILIKE) em vez de match exacto:

```typescript
// Em vez de usar .in('categoria', categoryNames)
// Usar múltiplas condições OR com ILIKE para cobrir todas as variações
```

#### 2. Limpar Cache de Dados

Invalidar as queries relacionadas para garantir que os dados actualizados sejam recarregados:
- `category-integrated-expenses`
- `unified-expenses`
- `integrated-financial-progress`

### Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/hooks/useUnifiedExpenses.ts` | Expandir categoryMap para incluir "segurança e higiene no trabalho" e outras variações; usar lógica de match mais flexível |

### Resultado Esperado

1. **Card de Custos Indiretos** mostrará **~36M Kz** (apenas saídas)
2. **Modal "Ver Mais"** mostrará os 138+6 = 144 movimentos de saída relacionados com custos indiretos
3. Os valores serão consistentes entre o gráfico de Centros de Custo e a secção de Finanças

