
-- Criar enum para status dos projetos
CREATE TYPE projeto_status AS ENUM ('Em Andamento', 'Atrasado', 'Concluído', 'Pausado');

-- Criar enum para status do fluxo de requisições
CREATE TYPE status_fluxo AS ENUM ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção', 'OC Gerada', 'Recepcionado', 'Liquidado');

-- Criar enum para categorias de colaboradores
CREATE TYPE categoria_colaborador AS ENUM ('Oficial', 'Auxiliar', 'Técnico Superior');

-- Criar enum para tipos de incidentes
CREATE TYPE tipo_incidente AS ENUM ('Incidente', 'Near-miss');

-- Criar enum para severidade
CREATE TYPE severidade AS ENUM ('Baixa', 'Média', 'Alta');

-- Criar enum para status de tarefas
CREATE TYPE status_tarefa AS ENUM ('Pendente', 'Em Andamento', 'Concluído');

-- Criar enum para tipos de tarefas lean
CREATE TYPE tipo_tarefa_lean AS ENUM ('PDCA', '5S', 'Melhoria', 'Corretiva');

-- Criar enum para status de patrimônio
CREATE TYPE status_patrimonio AS ENUM ('Em Uso', 'Disponível', 'Manutenção', 'Transferência');

-- Criar enum para tipos de patrimônio
CREATE TYPE tipo_patrimonio AS ENUM ('Gerador', 'Betoneira', 'Andaime', 'Ferramenta', 'Outros');

-- Criar enum para status de fichas técnicas
CREATE TYPE status_ficha AS ENUM ('Pendente', 'Aprovado', 'Rejeitado');

-- Tabela de projetos/obras
CREATE TABLE public.projetos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cliente TEXT NOT NULL,
  orcamento BIGINT NOT NULL DEFAULT 0,
  gasto BIGINT NOT NULL DEFAULT 0,
  avanco_fisico INTEGER NOT NULL DEFAULT 0 CHECK (avanco_fisico >= 0 AND avanco_fisico <= 100),
  avanco_financeiro INTEGER NOT NULL DEFAULT 0 CHECK (avanco_financeiro >= 0 AND avanco_financeiro <= 100),
  avanco_tempo INTEGER NOT NULL DEFAULT 0 CHECK (avanco_tempo >= 0 AND avanco_tempo <= 100),
  data_inicio DATE NOT NULL,
  data_fim_prevista DATE NOT NULL,
  status projeto_status NOT NULL DEFAULT 'Em Andamento',
  encarregado TEXT NOT NULL,
  limite_aprovacao BIGINT NOT NULL DEFAULT 3000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de finanças por projeto
CREATE TABLE public.financas (
  id SERIAL PRIMARY KEY,
  id_projeto INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  orcamentado BIGINT NOT NULL DEFAULT 0,
  gasto BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de materiais
CREATE TABLE public.materiais (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  unidade TEXT NOT NULL,
  grupo_lean TEXT NOT NULL,
  necessita_aprovacao_qualidade BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fichas técnicas
CREATE TABLE public.fichas_tecnicas (
  id SERIAL PRIMARY KEY,
  id_material INTEGER REFERENCES public.materiais(id) ON DELETE CASCADE,
  pdf_url TEXT,
  aprovado_por TEXT,
  data_aprovacao DATE,
  status status_ficha NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de requisições
CREATE TABLE public.requisicoes (
  id SERIAL PRIMARY KEY,
  id_material INTEGER REFERENCES public.materiais(id) ON DELETE RESTRICT,
  id_projeto INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  valor BIGINT NOT NULL DEFAULT 0,
  aprovacao_qualidade BOOLEAN NOT NULL DEFAULT false,
  status_fluxo status_fluxo NOT NULL DEFAULT 'Pendente',
  data_requisicao DATE NOT NULL DEFAULT CURRENT_DATE,
  requisitante TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de patrimônio
CREATE TABLE public.patrimonio (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  alocado_projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE SET NULL,
  status status_patrimonio NOT NULL DEFAULT 'Disponível',
  tipo tipo_patrimonio NOT NULL DEFAULT 'Outros',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de colaboradores
CREATE TABLE public.colaboradores (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  categoria categoria_colaborador NOT NULL,
  custo_hora INTEGER NOT NULL DEFAULT 0,
  projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE SET NULL,
  hora_entrada TIME,
  hora_saida TIME,
  offline_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de incidentes
CREATE TABLE public.incidentes (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  id_projeto INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  tipo tipo_incidente NOT NULL,
  descricao TEXT NOT NULL,
  severidade severidade NOT NULL,
  etapa_relacionada TEXT NOT NULL,
  reportado_por TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas lean
CREATE TABLE public.tarefas_lean (
  id SERIAL PRIMARY KEY,
  id_projeto INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  prazo DATE NOT NULL,
  status status_tarefa NOT NULL DEFAULT 'Pendente',
  percentual_conclusao INTEGER NOT NULL DEFAULT 0 CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
  tipo tipo_tarefa_lean NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de EPIs
CREATE TABLE public.epis (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  tarefa_relacionada TEXT NOT NULL,
  estoque_minimo INTEGER NOT NULL DEFAULT 0,
  estoque_atual INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de KPIs do dashboard
CREATE TABLE public.dashboard_kpis (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  avanco_fisico_real INTEGER NOT NULL DEFAULT 0,
  avanco_financeiro_real INTEGER NOT NULL DEFAULT 0,
  desvio_prazo_dias INTEGER NOT NULL DEFAULT 0,
  lead_time_compras_medio DECIMAL(5,2) NOT NULL DEFAULT 0,
  absentismo_percentual DECIMAL(5,2) NOT NULL DEFAULT 0,
  status_alerta TEXT NOT NULL DEFAULT 'Verde',
  data_calculo DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(projeto_id, data_calculo)
);

-- Habilitar Row Level Security em todas as tabelas
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_lean ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_kpis ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para permitir acesso (por enquanto permissivas - depois ajustamos por papel)
CREATE POLICY "Allow all operations for authenticated users" ON public.projetos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.financas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.materiais
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.fichas_tecnicas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.requisicoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.patrimonio
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.colaboradores
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.incidentes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.tarefas_lean
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.epis
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.dashboard_kpis
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inserir dados mock para teste
INSERT INTO public.projetos (nome, cliente, orcamento, gasto, avanco_fisico, avanco_financeiro, avanco_tempo, data_inicio, data_fim_prevista, status, encarregado, limite_aprovacao) VALUES
('Ed. Atlântico', 'Imobiliária Horizonte', 500000000, 380000000, 75, 76, 68, '2024-01-15', '2025-06-30', 'Atrasado', 'Eng. João Silva', 10000000),
('Cond. Baía Azul', 'Grupo V&V', 350000000, 150000000, 42, 43, 45, '2024-03-01', '2025-08-15', 'Em Andamento', 'Eng. Maria Costa', 3000000),
('Hospital Central', 'Governo Provincial', 800000000, 780000000, 95, 97, 92, '2023-06-01', '2025-01-30', 'Em Andamento', 'Eng. Carlos Mendes', 10000000);

INSERT INTO public.materiais (nome, codigo, unidade, grupo_lean, necessita_aprovacao_qualidade) VALUES
('Cimento Portland', 'CIM-001', 'Saco 50kg', 'Estrutura', false),
('Vergalhão de Aço CA-50 12mm', 'ACO-012', 'Vara 12m', 'Estrutura', true),
('Gerador 50kVA', 'GER-050', 'Unidade', 'Equipamento', false),
('EPI - Capacete', 'EPI-001', 'Unidade', 'Segurança', true),
('Tijolo Cerâmico 6 furos', 'TIJ-006', 'Milheiro', 'Alvenaria', true);

INSERT INTO public.financas (id_projeto, categoria, orcamentado, gasto) VALUES
(1, 'Mão-de-Obra', 150000000, 165000000),
(1, 'Materiais', 250000000, 200000000),
(1, 'Serviços Terceiros', 50000000, 15000000),
(1, 'Administrativos', 30000000, 25000000),
(1, 'Outros', 20000000, 10000000),
(2, 'Mão-de-Obra', 100000000, 40000000),
(2, 'Materiais', 200000000, 110000000),
(2, 'Serviços Terceiros', 30000000, 8000000),
(3, 'Mão-de-Obra', 300000000, 295000000),
(3, 'Materiais', 400000000, 385000000),
(3, 'Serviços Terceiros', 80000000, 75000000),
(3, 'Administrativos', 20000000, 25000000);
