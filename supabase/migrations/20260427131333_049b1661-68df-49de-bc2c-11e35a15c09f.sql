-- Harden invitation workflow and keep roles synchronized

-- Ensure invitation tokens cannot be duplicated
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_token_unique
ON public.invitations(token);

CREATE INDEX IF NOT EXISTS idx_invitations_email_pending
ON public.invitations(lower(email), used_at, expires_at);

-- Remove direct anonymous table reads; validation will happen through a controlled RPC
DROP POLICY IF EXISTS public_read_valid_invitation ON public.invitations;

-- Recreate manager policy defensively
DROP POLICY IF EXISTS directors_manage_invitations ON public.invitations;
CREATE POLICY directors_manage_invitations
ON public.invitations
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'diretor_tecnico'::public.app_role)
  OR public.has_role(auth.uid(), 'coordenacao_direcao'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'diretor_tecnico'::public.app_role)
  OR public.has_role(auth.uid(), 'coordenacao_direcao'::public.app_role)
);

-- Validate a single invitation by secret token without exposing the invitations table
CREATE OR REPLACE FUNCTION public.validate_invitation(p_token uuid)
RETURNS TABLE (
  email text,
  nome text,
  cargo public.app_role,
  invited_by_name text,
  expires_at timestamptz,
  used_at timestamptz,
  status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.email,
    i.nome,
    i.cargo,
    i.invited_by_name,
    i.expires_at,
    i.used_at,
    CASE
      WHEN i.used_at IS NOT NULL THEN 'used'
      WHEN i.expires_at <= now() THEN 'expired'
      ELSE 'valid'
    END AS status
  FROM public.invitations i
  WHERE i.token = p_token
  LIMIT 1;
END;
$$;

-- Accept an invitation for the currently authenticated user only
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation public.invitations%ROWTYPE;
  v_user_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'status', 'not_authenticated', 'error', 'Precisa iniciar sessão para aceitar este convite.');
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  SELECT * INTO v_invitation
  FROM public.invitations
  WHERE token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'status', 'invalid', 'error', 'Convite inválido.');
  END IF;

  IF lower(v_invitation.email) <> lower(v_user_email) THEN
    RETURN jsonb_build_object('success', false, 'status', 'email_mismatch', 'error', 'Este convite pertence a outro email.');
  END IF;

  IF v_invitation.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'status', 'already_used');
  END IF;

  IF v_invitation.expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'status', 'expired', 'error', 'Este convite expirou.');
  END IF;

  INSERT INTO public.profiles (id, nome, email, cargo, ativo)
  VALUES (auth.uid(), v_invitation.nome, v_invitation.email, v_invitation.cargo::text::public.user_role, true)
  ON CONFLICT (id) DO UPDATE SET
    nome = COALESCE(NULLIF(EXCLUDED.nome, ''), public.profiles.nome),
    email = EXCLUDED.email,
    cargo = EXCLUDED.cargo,
    ativo = true,
    updated_at = now();

  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (auth.uid(), v_invitation.cargo, v_invitation.invited_by)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.invitations
  SET used_at = now()
  WHERE id = v_invitation.id AND used_at IS NULL;

  RETURN jsonb_build_object('success', true, 'status', 'accepted');
END;
$$;

-- Create/update profile from invitation during auth signup
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

  IF FOUND THEN
    UPDATE public.invitations
    SET used_at = now()
    WHERE id = v_invitation.id AND used_at IS NULL;
  END IF;

  RETURN new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invitation(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(uuid) TO authenticated;