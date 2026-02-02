

## Melhorar Formulário de Alocamento de Material

### Contexto
O formulário de requisição do tipo "Alocamento de Material" precisa de melhorias para incluir:
1. **Campo para selecionar o Projeto de destino** - para onde o material será alocado
2. **Limite de quantidade** - baseado no stock disponível do material selecionado

---

### Alterações Planeadas

#### 1. Adicionar Campo "Projeto Destino" na Secção de Alocamento
Quando o utilizador escolhe "Alocamento de Material", irá aparecer:
- Um **seletor de projeto** para indicar para qual obra o material será enviado
- Este campo aparecerá logo após a seleção do material do armazém

#### 2. Melhorar Validação de Quantidade
O campo de quantidade terá:
- **Indicação visual do stock disponível** junto ao campo
- **Limite máximo** baseado no stock do material selecionado
- **Aviso em tempo real** se a quantidade exceder o disponível
- **Bloqueio de submissão** se quantidade > stock disponível

#### 3. Layout Melhorado da Secção de Alocamento
Nova estrutura visual:

```text
┌─────────────────────────────────────────────────────────┐
│  📦 Selecionar Material do Armazém                      │
├─────────────────────────────────────────────────────────┤
│  Material Disponível: [Dropdown com stock]              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Material: Cimento Portland                       │   │
│  │ Código: MAT-001                                  │   │
│  │ Stock Disponível: 150 sacos                      │   │
│  │ Localização: Armazém A - Prateleira 3            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🏗️ Projeto Destino: [Dropdown de Projetos]            │
│                                                         │
│  📊 Quantidade a Alocar: [    50    ]  /  150 disponível│
│     ⚠️ Quantidade excede o stock (se aplicável)        │
└─────────────────────────────────────────────────────────┘
```

---

### Detalhes Técnicos

#### Ficheiro: `src/components/forms/RequisitionForm.tsx`

**1. Novo Estado para Projeto Destino:**
```typescript
const [projetoDestinoId, setProjetoDestinoId] = useState<number | null>(null);
```

**2. Importar useProjects:**
```typescript
import { useProjects } from "@/hooks/useProjects";
// ...
const { data: projects = [] } = useProjects();
```

**3. Nova Secção de Projeto Destino (após seleção de material):**
- Adicionar campo de seleção de projeto com lista de todos os projetos activos
- Campo obrigatório para alocamento

**4. Melhorar Campo de Quantidade para Alocamento:**
- Mostrar stock disponível ao lado do campo
- Adicionar validação visual em tempo real
- Limitar input máximo ao stock disponível

**5. Atualizar Validação no Submit:**
- Validar que projeto destino foi selecionado
- Validar que quantidade ≤ stock disponível
- Incluir `projeto_destino_id` nos dados enviados

#### Migração de Base de Dados (Opcional)
Se a tabela `requisicoes` não tiver coluna para projecto destino diferente do projecto origem, será necessário:
- Adicionar coluna `projeto_destino_id` (INTEGER, FK para projetos)
- Esta coluna será usada apenas para alocamentos

---

### Resultado Final

Quando o utilizador selecionar "Alocamento de Material":
1. ✅ Seleciona o material do armazém (já existe)
2. ✅ **NOVO**: Seleciona o projeto destino para alocar
3. ✅ **MELHORADO**: Campo de quantidade mostra limite disponível
4. ✅ Sistema valida que quantidade ≤ stock antes de submeter

