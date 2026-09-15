CREATE TABLE IF NOT EXISTS public.contratante_codigos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  codigo text NOT NULL,
  status_codigo text NOT NULL DEFAULT 'ativo',
  expira_em timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  usado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contratante_codigos_status_check CHECK (status_codigo IN ('ativo','usado','expirado'))
);

CREATE INDEX IF NOT EXISTS idx_contratante_codigos_user ON public.contratante_codigos (user_id);
CREATE INDEX IF NOT EXISTS idx_contratante_codigos_codigo ON public.contratante_codigos (codigo);

GRANT SELECT ON public.contratante_codigos TO authenticated;
GRANT ALL ON public.contratante_codigos TO service_role;

ALTER TABLE public.contratante_codigos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve seus codigos" ON public.contratante_codigos;
CREATE POLICY "Usuario ve seus codigos"
  ON public.contratante_codigos FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_contratante_codigos_updated_at ON public.contratante_codigos;
CREATE TRIGGER trg_contratante_codigos_updated_at
  BEFORE UPDATE ON public.contratante_codigos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();