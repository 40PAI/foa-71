

## Correção: Formulário de Amortização com Seleção de Dívidas Ativas

### Problema Identificado

Quando o utilizador seleciona "Amortização (Pagamento)" como tipo de movimento, o formulário continua a mostrar os mesmos campos (Descrição, Valor, etc.) como se fosse um novo crédito. Isto está incorreto porque:

1. Uma amortização é um **pagamento de uma dívida existente**
2. O utilizador deveria ver uma lista das dívidas activas para selecionar qual amortizar
3. O valor e descrição deveriam ser preenchidos com base na dívida seleccionada

### Comportamento Esperado

**Quando tipo = "Crédito Recebido":**
- Formulário actual (criar novo crédito)
- Campos: Descrição, Valor, Data Vencimento, etc.

**Quando tipo = "Amortização (Pagamento)":**
- Mostrar lista de dívidas activas (créditos com saldo devedor > 0)
- Agrupar por Fonte + Credor
- Mostrar saldo devedor de cada dívida
- Valor máximo = saldo devedor da dívida selecionada
- Descrição automática: "Amortização de [Nome do Credor]"

**Quando tipo = "Pagamento de Juros":**
- Similar à amortização (selecionar dívida activa)
- Valor livre para introduzir montante dos juros

### Solução Técnica

#### 1. Adicionar Hook para Dívidas Activas

Utilizar o hook `useResumoDividas()` que já existe e retorna:
```typescript
{
  fonte_credito: FonteCredito;
  credor_nome: string;
  total_credito: number;
  total_amortizado: number;
  saldo_devedor: number;  // = total_credito - total_amortizado
  status: 'ativo' | 'quitado';
}
```

#### 2. Modificar `ReembolsoFOAModal.tsx`

Adicionar lógica condicional baseada no tipo de movimento:

```text
┌─────────────────────────────────────────────────────────────┐
│                  ReembolsoFOAModal                          │
├─────────────────────────────────────────────────────────────┤
│  Fonte de Crédito: [FOF] [Banco] [Fornecedor] [Outro]       │
├─────────────────────────────────────────────────────────────┤
│  Projeto: [CATETE ▼]                                        │
├─────────────────────────────────────────────────────────────┤
│  Tipo de Movimento: [Amortização (Pagamento) ▼]   Data: []  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─── SE TIPO = AMORTIZAÇÃO ou JUROS ───────────────────┐   │
│  │                                                       │   │
│  │  Selecione a Dívida a Amortizar *                     │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │ FOF - Saldo: 1.000.000,00 Kz              ▼     │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  💡 Saldo devedor: 1.000.000,00 Kz                    │   │
│  │                                                       │   │
│  │  Valor da Amortização *                               │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │ 100.000,00                                      │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │  ⚠️ Máximo: 1.000.000,00 Kz                           │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─── SE TIPO = CRÉDITO ────────────────────────────────┐   │
│  │                                                       │   │
│  │  Descrição *                                          │   │
│  │  [______________________________________________]     │   │
│  │                                                       │   │
│  │  Valor (AOA) *              Data de Vencimento        │   │
│  │  [___________]              [_______________]         │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  Observações                                                │
│  [__________________________________________________]       │
│                                                             │
│                         [Cancelar]  [Registrar]             │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Campos Condicionais por Tipo

| Tipo | Campos Visíveis |
|------|-----------------|
| **Crédito** | Fonte, Projeto, Data, Descrição, Valor, Data Vencimento, Taxa Juro, Observações |
| **Amortização** | Fonte, Projeto, Data, **Dívida (Select)**, **Valor a Amortizar**, Observações |
| **Juros** | Fonte, Projeto, Data, **Dívida (Select)**, Valor dos Juros, Observações |

#### 4. Estado Adicional no Formulário

```typescript
const [dividaSelecionada, setDividaSelecionada] = useState<string>("");

// Usar o hook existente para buscar dívidas activas
const { data: resumoDividas } = useResumoDividas(formData.projeto_id || undefined);

// Filtrar apenas dívidas activas (saldo_devedor > 0)
const dividasActivas = useMemo(() => 
  resumoDividas?.filter(d => d.saldo_devedor > 0) || [], 
  [resumoDividas]
);

// Obter saldo máximo da dívida selecionada
const saldoMaximo = useMemo(() => {
  const divida = dividasActivas.find(d => 
    `${d.fonte_credito}:${d.credor_nome}` === dividaSelecionada
  );
  return divida?.saldo_devedor || 0;
}, [dividasActivas, dividaSelecionada]);
```

#### 5. Validações Específicas para Amortização

```typescript
// No handleSubmit
if (formData.tipo === 'amortizacao' || formData.tipo === 'juro') {
  if (!dividaSelecionada) {
    toast.error("Selecione uma dívida para amortizar");
    return;
  }
  
  if (formData.tipo === 'amortizacao' && formData.valor > saldoMaximo) {
    toast.error(`Valor excede o saldo devedor (${formatCurrency(saldoMaximo)})`);
    return;
  }
}
```

### Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/modals/ReembolsoFOAModal.tsx` | Adicionar lógica condicional para mostrar dívidas activas quando tipo = amortização/juros |

### Resultado Esperado

1. Ao selecionar "Amortização (Pagamento)", aparece um dropdown com as dívidas activas
2. Cada opção mostra: "FOF - Saldo: 1.000.000,00 Kz"
3. O campo de valor mostra o máximo permitido
4. A descrição é preenchida automaticamente
5. Validação impede valores superiores ao saldo devedor

