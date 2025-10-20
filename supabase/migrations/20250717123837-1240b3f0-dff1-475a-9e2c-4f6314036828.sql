
-- Criar ENUMs para as novas categorias
CREATE TYPE categoria_principal_enum AS ENUM (
  'Material de Construção',
  'Equipamento de Obra', 
  'Ferramenta Manual',
  'Equipamento Elétrico',
  'Dispositivo de Medição',
  'Dispositivo de Conectividade',
  'Acessório/Sub-dispositivo',
  'Equipamento de Segurança (EPI)'
);

CREATE TYPE urgencia_prioridade_enum AS ENUM (
  'Alta',
  'Média',
  'Baixa'
);

-- Adicionar novos campos à tabela requisicoes
ALTER TABLE public.requisicoes 
ADD COLUMN categoria_principal categoria_principal_enum,
ADD COLUMN nome_comercial_produto TEXT,
ADD COLUMN codigo_produto TEXT,
ADD COLUMN descricao_tecnica TEXT,
ADD COLUMN quantidade_requisitada DECIMAL(10,2),
ADD COLUMN unidade_medida unidade_medida_enum,
ADD COLUMN valor_unitario DECIMAL(12,2),
ADD COLUMN fornecedor_preferencial TEXT,
ADD COLUMN urgencia_prioridade urgencia_prioridade_enum DEFAULT 'Média';

-- Criar índices para melhor performance
CREATE INDEX idx_requisicoes_categoria ON public.requisicoes(categoria_principal);
CREATE INDEX idx_requisicoes_urgencia ON public.requisicoes(urgencia_prioridade);
CREATE INDEX idx_requisicoes_codigo_produto ON public.requisicoes(codigo_produto);

-- Atualizar registros existentes com valores padrão para evitar problemas
UPDATE public.requisicoes 
SET 
  categoria_principal = 'Material de Construção',
  nome_comercial_produto = COALESCE(
    (SELECT nome FROM materiais WHERE materiais.id = requisicoes.id_material), 
    'Produto não especificado'
  ),
  descricao_tecnica = 'Descrição a ser atualizada',
  quantidade_requisitada = 1,
  unidade_medida = 'unidade',
  valor_unitario = valor,
  urgencia_prioridade = 'Média'
WHERE categoria_principal IS NULL;
