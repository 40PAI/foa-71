-- Fix invitation consumption: sending a Supabase invite creates an auth user,
-- which fires handle_new_user. That must not consume the invitation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation public.invitations%ROWTYPE;
  v_role public.app_role := 'encarregado_obra'::public.app_role;
  v_nome text;
BEGIN
  SELECT * INTO v_invitation
  FROM public.invitations
  WHERE lower(email) = lower(new.email)
    AND used_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    v_role := v_invitation.cargo;
    v_nome := COALESCE(NULLIF(new.raw_user_meta_data ->> 'nome', ''), v_invitation.nome, new.email);
  ELSE
    v_nome := COALESCE(NULLIF(new.raw_user_meta_data ->> 'nome', ''), new.email);
  END IF;

  INSERT INTO public.profiles (id, nome, email, cargo, ativo)
  VALUES (new.id, v_nome, new.email, v_role::text::public.user_role, true)
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    cargo = EXCLUDED.cargo,
    ativo = true,
    updated_at = now();

  DELETE FROM public.user_roles WHERE user_id = new.id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Important: do not set invitations.used_at here.
  -- A Supabase admin invite creates the auth user before the person opens the link.
  -- The invitation is consumed only by public.accept_invitation after the user is authenticated.
  RETURN new;
END;
$$;

-- Reopen invites that were automatically consumed at send time by the old trigger.
-- These have used_at almost equal to created_at and are still within their expiry window.
UPDATE public.invitations
SET used_at = NULL
WHERE used_at IS NOT NULL
  AND expires_at > now()
  AND used_at <= created_at + interval '2 minutes';