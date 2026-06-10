CREATE INDEX IF NOT EXISTS idx_servicos_ativo_created_at ON public.servicos (ativo, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidaturas_user_status_created_at ON public.candidaturas (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidaturas_servico_created_at ON public.candidaturas (servico_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidaturas_status_aprovada_em ON public.candidaturas (status, aprovada_em DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_trabalhador_tipo_created_at ON public.avaliacoes (trabalhador_id, tipo, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_candidatura_tipo ON public.avaliacoes (candidatura_id, tipo);