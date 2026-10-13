CREATE TABLE public.chat_conversas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidatura_id uuid NOT NULL UNIQUE REFERENCES public.candidaturas(id) ON DELETE CASCADE,
  servico_id uuid NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  contratante_id uuid NOT NULL,
  trabalhador_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','encerrado')),
  encerrado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.chat_conversas TO authenticated;
GRANT ALL ON public.chat_conversas TO service_role;
ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes veem conversa" ON public.chat_conversas FOR SELECT TO authenticated
USING (auth.uid() = contratante_id OR auth.uid() = trabalhador_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Contratante cria conversa" ON public.chat_conversas FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = contratante_id AND (
    public.has_role(auth.uid(),'admin') OR EXISTS (
      SELECT 1 FROM public.servicos s WHERE s.id = servico_id AND s.created_by = auth.uid()
    )
  ) AND EXISTS (
    SELECT 1 FROM public.candidaturas c WHERE c.id = candidatura_id AND c.user_id = trabalhador_id AND c.servico_id = chat_conversas.servico_id
  )
);

CREATE POLICY "Contratante encerra conversa" ON public.chat_conversas FOR UPDATE TO authenticated
USING (auth.uid() = contratante_id OR public.has_role(auth.uid(),'admin'))
WITH CHECK (auth.uid() = contratante_id OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_chat_conversas_updated_at BEFORE UPDATE ON public.chat_conversas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.chat_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id uuid NOT NULL REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL,
  texto text NOT NULL CHECK (length(btrim(texto)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_mensagens_conversa ON public.chat_mensagens(conversa_id, created_at);
GRANT SELECT, INSERT ON public.chat_mensagens TO authenticated;
GRANT ALL ON public.chat_mensagens TO service_role;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes leem mensagens" ON public.chat_mensagens FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.chat_conversas c WHERE c.id = conversa_id
  AND (auth.uid() IN (c.contratante_id, c.trabalhador_id) OR public.has_role(auth.uid(),'admin'))));

CREATE POLICY "Participantes enviam em conversa aberta" ON public.chat_mensagens FOR INSERT TO authenticated
WITH CHECK (autor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_conversas c WHERE c.id = conversa_id
  AND c.status = 'aberto' AND auth.uid() IN (c.contratante_id, c.trabalhador_id)));

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_mensagens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversas;

CREATE OR REPLACE FUNCTION public.estatisticas_trabalhadores(_ids uuid[])
RETURNS TABLE(user_id uuid, media_estrelas numeric, total_avaliacoes integer, pct_presenca integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT u.id,
    (SELECT round(avg(a.estrelas)::numeric, 1) FROM public.avaliacoes a WHERE a.trabalhador_id = u.id AND a.tipo = 'empresa_para_trabalhador'),
    (SELECT count(*)::int FROM public.avaliacoes a WHERE a.trabalhador_id = u.id AND a.tipo = 'empresa_para_trabalhador'),
    (SELECT CASE WHEN count(*) = 0 THEN NULL
       ELSE round(100.0 * count(*) FILTER (WHERE c.presenca_confirmada_em IS NOT NULL OR c.chegada_confirmada_em IS NOT NULL) / count(*))::int END
     FROM public.candidaturas c WHERE c.user_id = u.id AND c.status IN ('aprovada','concluida'))
  FROM unnest(_ids) AS u(id)
  WHERE auth.uid() IS NOT NULL AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'contratante'));
$$;
REVOKE EXECUTE ON FUNCTION public.estatisticas_trabalhadores(uuid[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.estatisticas_trabalhadores(uuid[]) TO authenticated;