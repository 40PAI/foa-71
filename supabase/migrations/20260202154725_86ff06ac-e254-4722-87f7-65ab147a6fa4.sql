
-- Corrigir inconsistência entre user_roles e profiles
-- Sincronizar user_roles com o cargo atual de cada profile

-- Primeiro, limpar os roles existentes
DELETE FROM public.user_roles;

-- Depois, inserir os roles corretos baseados em profiles.cargo
-- Usar cast via text para converter entre os enum types
INSERT INTO public.user_roles (user_id, role)
SELECT id, (cargo::text)::app_role
FROM public.profiles
WHERE cargo IS NOT NULL;

-- Criar trigger para manter sincronizado quando o cargo mudar em profiles
CREATE OR REPLACE FUNCTION public.sync_user_role_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se cargo foi alterado
  IF NEW.cargo IS DISTINCT FROM OLD.cargo THEN
    -- Atualizar ou inserir o novo role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.cargo::text)::app_role)
    ON CONFLICT (user_id, role) 
    DO NOTHING;
    
    -- Remover o role antigo se existia
    IF OLD.cargo IS NOT NULL THEN
      DELETE FROM public.user_roles 
      WHERE user_id = NEW.id AND role = (OLD.cargo::text)::app_role;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.profiles;
CREATE TRIGGER sync_user_role_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_on_profile_change();

-- Também sincronizar quando um novo profile é criado
CREATE OR REPLACE FUNCTION public.sync_user_role_on_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cargo IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.cargo::text)::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_role_insert_trigger ON public.profiles;
CREATE TRIGGER sync_user_role_insert_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_on_profile_insert();
