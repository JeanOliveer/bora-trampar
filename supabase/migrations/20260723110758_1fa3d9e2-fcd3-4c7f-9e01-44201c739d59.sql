CREATE TABLE public.user_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('termos_uso','politica_privacidade')),
  version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_acceptances_user ON public.user_acceptances(user_id, document_type);

GRANT SELECT, INSERT ON public.user_acceptances TO authenticated;
GRANT ALL ON public.user_acceptances TO service_role;

ALTER TABLE public.user_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own acceptances"
  ON public.user_acceptances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own acceptances"
  ON public.user_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
