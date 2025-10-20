-- Adicionar SET search_path em todas as funções para segurança
-- Isso corrige os avisos: Function Search Path Mutable

-- 1. Atualizar calculate_stage_progress
CREATE OR REPLACE FUNCTION public.calculate_stage_progress(stage_id integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    avg_progress INTEGER;
BEGIN
    SELECT COALESCE(AVG(percentual_conclusao), 0)::INTEGER
    INTO avg_progress
    FROM tarefas_lean
    WHERE id_etapa = stage_id;
    
    RETURN avg_progress;
END;
$function$;

-- 2. Atualizar calculate_project_physical_progress
CREATE OR REPLACE FUNCTION public.calculate_project_physical_progress(project_id integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    avg_progress INTEGER;
BEGIN
    SELECT COALESCE(AVG(calculate_stage_progress(id)), 0)::INTEGER
    INTO avg_progress
    FROM etapas_projeto
    WHERE projeto_id = project_id;
    
    RETURN avg_progress;
END;
$function$;

-- 3. Atualizar map_categoria_principal_to_financas
CREATE OR REPLACE FUNCTION public.map_categoria_principal_to_financas(categoria categoria_principal_enum)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN CASE categoria
    WHEN 'Material' THEN 'Materiais de Construção'
    WHEN 'Mão de Obra' THEN 'Mão de Obra'
    WHEN 'Património' THEN 'Equipamentos'
    WHEN 'Custos Indiretos' THEN 'Custos Indiretos'
    ELSE 'Outros'
  END;
END;
$function$;

-- 4. Atualizar calculate_patrimony_expenses
CREATE OR REPLACE FUNCTION public.calculate_patrimony_expenses(project_id integer)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    total_patrimony NUMERIC := 0;
    patrimony_record RECORD;
    allocation_days INTEGER;
    daily_depreciation NUMERIC;
BEGIN
    FOR patrimony_record IN
        SELECT 
            p.id,
            p.nome,
            p.tipo,
            CASE p.tipo
                WHEN 'Gerador' THEN 80000
                WHEN 'Betoneira' THEN 50000
                WHEN 'Andaime' THEN 30000
                WHEN 'Ferramenta' THEN 5000
                WHEN 'Outros' THEN 10000
                ELSE 10000
            END as estimated_value
        FROM patrimonio p
        WHERE p.alocado_projeto_id = project_id
          AND p.status = 'Em Uso'
    LOOP
        SELECT EXTRACT(DAY FROM (NOW() - created_at)) INTO allocation_days
        FROM patrimonio
        WHERE id = patrimony_record.id;
        
        daily_depreciation := patrimony_record.estimated_value / (365 * 5);
        total_patrimony := total_patrimony + (daily_depreciation * COALESCE(allocation_days, 0));
    END LOOP;
    
    RETURN COALESCE(total_patrimony, 0);
END;
$function$;

-- 5. Atualizar calculate_payroll_expenses
CREATE OR REPLACE FUNCTION public.calculate_payroll_expenses(project_id integer)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    total_payroll NUMERIC := 0;
    colaborador_record RECORD;
    days_worked INTEGER;
    daily_cost NUMERIC;
BEGIN
    FOR colaborador_record IN
        SELECT 
            c.id,
            c.custo_hora,
            cp.funcao,
            cp.horario_tipo,
            cp.data_alocacao
        FROM colaboradores c
        JOIN colaboradores_projetos cp ON c.id = cp.colaborador_id
        WHERE cp.projeto_id = project_id
    LOOP
        SELECT COUNT(*) INTO days_worked
        FROM ponto_diario pd
        WHERE pd.colaborador_id = colaborador_record.id
          AND pd.projeto_id = project_id
          AND pd.status = 'presente';
        
        CASE colaborador_record.horario_tipo
            WHEN 'integral' THEN daily_cost := colaborador_record.custo_hora * 8;
            WHEN 'meio_periodo' THEN daily_cost := colaborador_record.custo_hora * 4;
            WHEN 'turno' THEN daily_cost := colaborador_record.custo_hora * 6;
            ELSE daily_cost := colaborador_record.custo_hora * 8;
        END CASE;
        
        total_payroll := total_payroll + (daily_cost * days_worked);
    END LOOP;
    
    RETURN COALESCE(total_payroll, 0);
END;
$function$;

-- 6. Atualizar calculate_material_expenses
CREATE OR REPLACE FUNCTION public.calculate_material_expenses(project_id integer)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    total_materials NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO total_materials
    FROM requisicoes
    WHERE id_projeto = project_id
      AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado');
    
    RETURN total_materials;
END;
$function$;

-- 7. Atualizar auto_categorize_expense
CREATE OR REPLACE FUNCTION public.auto_categorize_expense(descricao_texto text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF descricao_texto ~* '(cimento|areia|brita|ferro|tijolo|bloco|argamassa|concreto|material)' THEN
    RETURN 'Materiais de Construção';
  END IF;
  
  IF descricao_texto ~* '(equipamento|gerador|betoneira|andaime|ferramenta|máquina|aluguel|locação)' THEN
    RETURN 'Equipamentos';
  END IF;
  
  IF descricao_texto ~* '(salário|mão.?de.?obra|pedreiro|servente|encarregado|engenheiro|pagamento|trabalhador)' THEN
    RETURN 'Mão de Obra';
  END IF;
  
  IF descricao_texto ~* '(transporte|frete|combustível|diesel|gasolina|caminhão|entrega)' THEN
    RETURN 'Custos Indiretos';
  END IF;
  
  IF descricao_texto ~* '(escritório|administrativo|água|luz|energia|telefone|internet|contabilidade)' THEN
    RETURN 'Custos Indiretos';
  END IF;
  
  RETURN 'Outros';
END;
$function$;

-- 8. Atualizar calculate_valor_liquido
CREATE OR REPLACE FUNCTION public.calculate_valor_liquido(valor_base numeric, percentual_imposto numeric DEFAULT 0, valor_imposto numeric DEFAULT 0, percentual_desconto numeric DEFAULT 0, valor_desconto numeric DEFAULT 0)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  valor_com_imposto NUMERIC;
  valor_final NUMERIC;
BEGIN
  valor_com_imposto := valor_base + (valor_base * percentual_imposto / 100) + valor_imposto;
  valor_final := valor_com_imposto - (valor_com_imposto * percentual_desconto / 100) - valor_desconto;
  
  RETURN GREATEST(0, valor_final);
END;
$function$;

-- 9. Atualizar calculate_dias_restantes
CREATE OR REPLACE FUNCTION public.calculate_dias_restantes(data_requisicao date, prazo_limite_dias integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  data_limite DATE;
  dias_restantes INTEGER;
BEGIN
  data_limite := data_requisicao + INTERVAL '1 day' * prazo_limite_dias;
  dias_restantes := (data_limite - CURRENT_DATE);
  
  IF dias_restantes < 0 THEN
    RETURN '0/' || prazo_limite_dias || ' (Vencido)';
  ELSE
    RETURN dias_restantes || '/' || prazo_limite_dias;
  END IF;
END;
$function$;