-- 1. Validação do código de acesso do contratante (código apenas no servidor)
CREATE OR REPLACE FUNCTION public.validar_codigo_contratante(_codigo text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT btrim(coalesce(_codigo, '')) = '34823877';
$$;

REVOKE ALL ON FUNCTION public.validar_codigo_contratante(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validar_codigo_contratante(text) TO anon, authenticated;

-- 2. Atribuição do papel de contratante ao usuário autenticado, somente com código válido
CREATE OR REPLACE FUNCTION public.assumir_papel_contratante(_codigo text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF NOT public.validar_codigo_contratante(_codigo) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'contratante')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles SET user_type = 'contratante' WHERE user_id = v_uid;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.assumir_papel_contratante(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assumir_papel_contratante(text) TO authenticated;

-- 3. Serviços: contratante gerencia apenas os próprios
CREATE POLICY "Contratantes criam seus servicos"
ON public.servicos FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'contratante') AND created_by = auth.uid());

CREATE POLICY "Contratantes atualizam seus servicos"
ON public.servicos FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'contratante') AND created_by = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'contratante') AND created_by = auth.uid());

CREATE POLICY "Contratantes removem seus servicos"
ON public.servicos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'contratante') AND created_by = auth.uid());

CREATE POLICY "Contratantes veem seus servicos"
ON public.servicos FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'contratante') AND created_by = auth.uid());

-- 4. Candidaturas dos serviços do contratante
CREATE POLICY "Contratantes veem candidaturas dos seus servicos"
ON public.candidaturas FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.servicos s
  WHERE s.id = candidaturas.servico_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
));

CREATE POLICY "Contratantes atualizam candidaturas dos seus servicos"
ON public.candidaturas FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.servicos s
  WHERE s.id = candidaturas.servico_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.servicos s
  WHERE s.id = candidaturas.servico_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
));

-- 5. Respostas das candidaturas dos serviços do contratante
CREATE POLICY "Contratantes veem respostas dos seus servicos"
ON public.candidatura_respostas FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.candidaturas c
  JOIN public.servicos s ON s.id = c.servico_id
  WHERE c.id = candidatura_respostas.candidatura_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
));

-- 6. Perguntas dos serviços do contratante
CREATE POLICY "Contratantes gerenciam perguntas dos seus servicos"
ON public.servico_perguntas FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.servicos s
  WHERE s.id = servico_perguntas.servico_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.servicos s
  WHERE s.id = servico_perguntas.servico_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
));

-- 7. Avaliações e perfis dos trabalhadores dos serviços do contratante
CREATE POLICY "Contratantes veem avaliacoes dos seus servicos"
ON public.avaliacoes FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.servicos s
  WHERE s.id = avaliacoes.servico_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
));

CREATE POLICY "Contratantes criam avaliacoes dos seus servicos"
ON public.avaliacoes FOR INSERT TO authenticated
WITH CHECK (
  avaliador_id = auth.uid()
  AND tipo = 'empresa_para_trabalhador'
  AND EXISTS (
    SELECT 1 FROM public.servicos s
    WHERE s.id = avaliacoes.servico_id
      AND s.created_by = auth.uid()
      AND public.has_role(auth.uid(), 'contratante')
  )
);

CREATE POLICY "Contratantes veem perfis dos candidatos dos seus servicos"
ON public.profiles FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.candidaturas c
  JOIN public.servicos s ON s.id = c.servico_id
  WHERE c.user_id = profiles.user_id
    AND s.created_by = auth.uid()
    AND public.has_role(auth.uid(), 'contratante')
));