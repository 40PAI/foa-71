-- Criar projeto demonstração (simplificado)
INSERT INTO projetos (
  nome, cliente, encarregado, tipo_projeto,
  data_inicio, data_fim_prevista,
  orcamento, limite_aprovacao, limite_gastos,
  status, provincia, municipio, zona_bairro,
  numero_etapas, metodo_calculo_temporal
) 
SELECT
  'Edifício Comercial Talatona Plaza',
  'Grupo Imobiliário Atlântico',
  'Eng. Carlos Mendes',
  'Comercial',
  '2024-09-01'::DATE,
  '2025-06-30'::DATE,
  45000000,
  3000000,
  45000000,
  'Em Andamento',
  'Luanda',
  'Belas',
  'Talatona',
  6,
  'ppc'
WHERE NOT EXISTS (
  SELECT 1 FROM projetos WHERE nome = 'Edifício Comercial Talatona Plaza'
);