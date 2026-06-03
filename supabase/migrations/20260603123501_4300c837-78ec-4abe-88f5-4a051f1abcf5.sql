
-- ============ servico_perguntas ============
CREATE TABLE public.servico_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id uuid NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  ordem int NOT NULL DEFAULT 0,
  texto text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('texto_curto','texto_longo','multipla_escolha')),
  opcoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  obrigatoria boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.servico_perguntas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servico_perguntas TO authenticated;
GRANT ALL ON public.servico_perguntas TO service_role;

ALTER TABLE public.servico_perguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um vê perguntas de serviços ativos"
ON public.servico_perguntas FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.servicos s WHERE s.id = servico_id AND (s.ativo = true OR public.has_role(auth.uid(),'admin')))
);

CREATE POLICY "Admins inserem perguntas"
ON public.servico_perguntas FOR INSERT
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins atualizam perguntas"
ON public.servico_perguntas FOR UPDATE
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins removem perguntas"
ON public.servico_perguntas FOR DELETE
USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_servico_perguntas_servico ON public.servico_perguntas(servico_id, ordem);

-- ============ candidatura_respostas ============
CREATE TABLE public.candidatura_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidatura_id uuid NOT NULL REFERENCES public.candidaturas(id) ON DELETE CASCADE,
  pergunta_id uuid NOT NULL REFERENCES public.servico_perguntas(id) ON DELETE CASCADE,
  resposta text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidatura_id, pergunta_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidatura_respostas TO authenticated;
GRANT ALL ON public.candidatura_respostas TO service_role;

ALTER TABLE public.candidatura_respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidato vê suas respostas / admin vê todas"
ON public.candidatura_respostas FOR SELECT
USING (
  public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.candidaturas c WHERE c.id = candidatura_id AND c.user_id = auth.uid())
);

CREATE POLICY "Candidato cria suas respostas"
ON public.candidatura_respostas FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.candidaturas c WHERE c.id = candidatura_id AND c.user_id = auth.uid())
);

CREATE POLICY "Admins removem respostas"
ON public.candidatura_respostas FOR DELETE
USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_respostas_candidatura ON public.candidatura_respostas(candidatura_id);

-- ============ candidaturas: novas colunas ============
ALTER TABLE public.candidaturas
  ADD COLUMN IF NOT EXISTS selfie_url text,
  ADD COLUMN IF NOT EXISTS documento_rg_url text,
  ADD COLUMN IF NOT EXISTS chegada_confirmada_em timestamptz;

-- ============ Storage policies (bucket documentos-candidatura) ============
DROP POLICY IF EXISTS "Usuário lê seus arquivos de candidatura" ON storage.objects;
DROP POLICY IF EXISTS "Usuário envia seus arquivos de candidatura" ON storage.objects;
DROP POLICY IF EXISTS "Admin lê arquivos de candidatura" ON storage.objects;

CREATE POLICY "Usuário lê seus arquivos de candidatura"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos-candidatura'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuário envia seus arquivos de candidatura"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentos-candidatura'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admin lê arquivos de candidatura"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos-candidatura'
  AND public.has_role(auth.uid(),'admin')
);

-- ============ Realtime ============
ALTER TABLE public.candidaturas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidaturas;
