
-- Criar ENUMs para as novas categorias
CREATE TYPE categoria_material_enum AS ENUM (
  'Material de Construção',
  'Equipamento', 
  'Ferramenta',
  'Consumível',
  'EPI',
  'Outro'
);

CREATE TYPE unidade_medida_enum AS ENUM (
  'saco',
  'm³',
  'm',
  'kg',
  'litro',
  'unidade',
  'outro'
);

CREATE TYPE status_material_enum AS ENUM (
  'Disponível',
  'Em uso',
  'Reservado',
  'Manutenção',
  'Inativo'
);

-- Criar nova tabela para materiais do armazém
CREATE TABLE public.materiais_armazem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_material TEXT NOT NULL,
  codigo_interno TEXT NOT NULL UNIQUE,
  categoria_principal categoria_material_enum NOT NULL,
  subcategoria TEXT NOT NULL,
  descricao_tecnica TEXT,
  unidade_medida unidade_medida_enum NOT NULL,
  quantidade_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  localizacao_fisica TEXT,
  fornecedor TEXT,
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  status_item status_material_enum NOT NULL DEFAULT 'Disponível',
  projeto_alocado_id INTEGER REFERENCES public.projetos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_materiais_armazem_codigo ON public.materiais_armazem(codigo_interno);
CREATE INDEX idx_materiais_armazem_categoria ON public.materiais_armazem(categoria_principal);
CREATE INDEX idx_materiais_armazem_status ON public.materiais_armazem(status_item);
CREATE INDEX idx_materiais_armazem_projeto ON public.materiais_armazem(projeto_alocado_id);

-- Habilitar RLS
ALTER TABLE public.materiais_armazem ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (acesso público para simplificar - pode ser restringido depois)
CREATE POLICY "Permitir acesso completo aos materiais do armazém" 
  ON public.materiais_armazem 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_materiais_armazem_updated_at 
  BEFORE UPDATE ON public.materiais_armazem 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
