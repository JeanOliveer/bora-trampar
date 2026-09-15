-- 1) Hide empresa_token / empresa_email from anon and authenticated
REVOKE SELECT ON public.servicos FROM anon, authenticated;

GRANT SELECT (
  id, titulo, descricao, categoria, valor, cidade, estado, data_servico,
  requisitos, ativo, created_by, created_at, updated_at, horario,
  empresa_nome, empresa_pontuacao, empresa_total_avaliacoes
) ON public.servicos TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.servicos TO authenticated;
GRANT ALL ON public.servicos TO service_role;

-- Owner/admin can retrieve the company token for their own service
CREATE OR REPLACE FUNCTION public.obter_token_servico(_servico_id uuid)
RETURNS TABLE (empresa_token uuid, empresa_email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.empresa_token, s.empresa_email
  FROM public.servicos s
  WHERE s.id = _servico_id
    AND (
      public.has_role(auth.uid(), 'admin')
      OR (s.created_by = auth.uid() AND public.has_role(auth.uid(), 'contratante'))
    );
$$;

-- Token holders (public company panel) get the service data without leaking other tokens
CREATE OR REPLACE FUNCTION public.obter_servico_por_token(_token uuid)
RETURNS TABLE (
  id uuid, titulo text, descricao text, categoria text, valor numeric,
  cidade text, estado text, data_servico date, horario text,
  empresa_nome text, empresa_pontuacao integer, empresa_total_avaliacoes integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.titulo, s.descricao, s.categoria, s.valor, s.cidade, s.estado,
         s.data_servico, s.horario, s.empresa_nome, s.empresa_pontuacao,
         s.empresa_total_avaliacoes
  FROM public.servicos s
  WHERE s.empresa_token = _token;
$$;

-- 2) Workers may only change their own check-in fields
CREATE OR REPLACE FUNCTION public.proteger_campos_candidatura()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_privilegiado boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.has_role(v_uid, 'admin') THEN
    v_privilegiado := true;
  ELSIF public.has_role(v_uid, 'contratante') AND EXISTS (
    SELECT 1 FROM public.servicos s
    WHERE s.id = NEW.servico_id AND s.created_by = v_uid
  ) THEN
    v_privilegiado := true;
  END IF;

  IF v_privilegiado THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id <> OLD.user_id
     OR NEW.servico_id <> OLD.servico_id
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.aprovada_pela_empresa IS DISTINCT FROM OLD.aprovada_pela_empresa
     OR NEW.aprovada_em IS DISTINCT FROM OLD.aprovada_em
     OR NEW.presenca_confirmada_em IS DISTINCT FROM OLD.presenca_confirmada_em
     OR NEW.chegada_confirmada_em IS DISTINCT FROM OLD.chegada_confirmada_em
     OR NEW.expediente_encerrado_em IS DISTINCT FROM OLD.expediente_encerrado_em THEN
    RAISE EXCEPTION 'Apenas a empresa contratante pode alterar o andamento da candidatura';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_campos_candidatura ON public.candidaturas;
CREATE TRIGGER trg_proteger_campos_candidatura
BEFORE UPDATE ON public.candidaturas
FOR EACH ROW EXECUTE FUNCTION public.proteger_campos_candidatura();

-- 3) Block self-promotion to contratante
DROP TRIGGER IF EXISTS trg_sincronizar_papel_contratante ON public.profiles;
DROP FUNCTION IF EXISTS public.sincronizar_papel_contratante();

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    user_type = (SELECT p.user_type FROM public.profiles p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (user_type = 'trabalhador'::public.user_type OR public.has_role(auth.uid(), 'contratante'))
);

-- handle_new_user must not honour client-supplied user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, nome_completo)
  VALUES (
    NEW.id,
    'trabalhador',
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', '')
  );
  RETURN NEW;
END;
$$;

-- 4) Restrict EXECUTE on SECURITY DEFINER functions to what the app needs
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notificar_avaliacao() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notificar_candidatura() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notificar_novo_servico() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.processar_avaliacao() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_candidatura() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.proteger_campos_candidatura() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.servico_token_valido(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validar_codigo_contratante(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_codigo_contratante(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assumir_papel_contratante(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obter_token_servico(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obter_servico_por_token(uuid) TO anon, authenticated;