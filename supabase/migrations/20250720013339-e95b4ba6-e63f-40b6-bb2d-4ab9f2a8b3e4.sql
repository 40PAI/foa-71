-- Create table for monthly project status
CREATE TABLE public.projeto_status_mensal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(projeto_id, mes, ano)
);

-- Enable RLS
ALTER TABLE public.projeto_status_mensal ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on projeto_status_mensal" 
ON public.projeto_status_mensal 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create table for monthly employee allocations
CREATE TABLE public.alocacao_mensal_colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id INTEGER NOT NULL,
  colaborador_id INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  funcao TEXT NOT NULL,
  horario_tipo TEXT NOT NULL DEFAULT 'Integral',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(projeto_id, colaborador_id, mes, ano)
);

-- Enable RLS
ALTER TABLE public.alocacao_mensal_colaboradores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on alocacao_mensal_colaboradores" 
ON public.alocacao_mensal_colaboradores 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_projeto_status_mensal_updated_at
BEFORE UPDATE ON public.projeto_status_mensal
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alocacao_mensal_colaboradores_updated_at
BEFORE UPDATE ON public.alocacao_mensal_colaboradores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();