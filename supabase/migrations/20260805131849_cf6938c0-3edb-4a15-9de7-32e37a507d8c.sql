-- 1. profiles: restringir leitura ao dono e admins
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Usuários veem seu próprio perfil ou admin"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.profiles FROM anon;

-- 2. servicos: remover política redundante USING (true)
DROP POLICY IF EXISTS "Acesso publico via token empresa" ON public.servicos;

-- Visitantes não autenticados não acessam token/e-mail da empresa
REVOKE SELECT ON public.servicos FROM anon;
GRANT SELECT (id, titulo, descricao, categoria, valor, cidade, estado, data_servico,
  requisitos, ativo, created_by, created_at, updated_at, horario, empresa_nome,
  empresa_pontuacao, empresa_total_avaliacoes) ON public.servicos TO anon;

-- 3. Fixar search_path
CREATE OR REPLACE FUNCTION public.calcular_pontos_estrelas(_estrelas smallint)
RETURNS smallint
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT CASE _estrelas
    WHEN 1 THEN -2
    WHEN 2 THEN -1
    WHEN 3 THEN 1
    WHEN 4 THEN 2
    WHEN 5 THEN 3
    ELSE 0
  END::smallint;
$function$;

-- 4. Revogar EXECUTE de funções que não devem ser chamadas pela API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.processar_avaliacao() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_candidatura() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.servico_token_valido(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calcular_pontos_estrelas(smallint) FROM PUBLIC, anon;