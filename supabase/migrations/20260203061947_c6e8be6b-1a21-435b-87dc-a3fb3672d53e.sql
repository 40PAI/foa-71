-- Primeiro, vamos verificar e remover o trigger problemático
-- que está a tentar atualizar uma Materialized View que na verdade é uma View normal

-- Remover o trigger que está a causar o erro
DROP TRIGGER IF EXISTS refresh_saldos_on_movimento ON movimentos_financeiros;

-- Remover a função problemática
DROP FUNCTION IF EXISTS refresh_saldos_centros_custo();

-- A view saldos_centros_custo já está a funcionar corretamente como uma VIEW normal
-- Não precisa de refresh porque é calculada em tempo real a partir das tabelas base