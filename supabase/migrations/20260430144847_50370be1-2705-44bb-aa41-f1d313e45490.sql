
-- 1) Pontuação no profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pontuacao integer NOT NULL DEFAULT 0;

-- 2) Tabela de avaliações
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidatura_id uuid NOT NULL REFERENCES public.candidaturas(id) ON DELETE CASCADE,
  servico_id uuid NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  trabalhador_id uuid NOT NULL,
  avaliador_id uuid NOT NULL,
  estrelas smallint NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
  justificativa text,
  pontos smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidatura_id)
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Ver avaliacoes (trab/avaliador/admin)" ON public.avaliacoes;
CREATE POLICY "Ver avaliacoes (trab/avaliador/admin)"
ON public.avaliacoes
FOR SELECT
USING (
  auth.uid() = trabalhador_id
  OR auth.uid() = avaliador_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins criam avaliacoes" ON public.avaliacoes;
CREATE POLICY "Admins criam avaliacoes"
ON public.avaliacoes
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND auth.uid() = avaliador_id
);

DROP POLICY IF EXISTS "Admins atualizam avaliacoes" ON public.avaliacoes;
CREATE POLICY "Admins atualizam avaliacoes"
ON public.avaliacoes
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins removem avaliacoes" ON public.avaliacoes;
CREATE POLICY "Admins removem avaliacoes"
ON public.avaliacoes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Função para calcular pontos por estrelas
CREATE OR REPLACE FUNCTION public.calcular_pontos_estrelas(_estrelas smallint)
RETURNS smallint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE _estrelas
    WHEN 1 THEN -2
    WHEN 2 THEN -1
    WHEN 3 THEN 1
    WHEN 4 THEN 2
    WHEN 5 THEN 3
    ELSE 0
  END::smallint;
$$;

-- 4) Trigger: validação + cálculo + atualização da pontuação do trabalhador
CREATE OR REPLACE FUNCTION public.processar_avaliacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pontos_old smallint := 0;
  v_pontos_new smallint := 0;
BEGIN
  IF TG_OP IN ('INSERT','UPDATE') THEN
    IF NEW.estrelas BETWEEN 1 AND 3
       AND (NEW.justificativa IS NULL OR length(btrim(NEW.justificativa)) < 5) THEN
      RAISE EXCEPTION 'Justificativa obrigatória para avaliações de 1, 2 ou 3 estrelas';
    END IF;
    NEW.pontos := public.calcular_pontos_estrelas(NEW.estrelas);
    v_pontos_new := NEW.pontos;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    v_pontos_old := OLD.pontos;
    UPDATE public.profiles
      SET pontuacao = pontuacao - v_pontos_old + v_pontos_new
      WHERE user_id = NEW.trabalhador_id;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
      SET pontuacao = pontuacao + v_pontos_new
      WHERE user_id = NEW.trabalhador_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
      SET pontuacao = pontuacao - OLD.pontos
      WHERE user_id = OLD.trabalhador_id;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_avaliacoes_biu ON public.avaliacoes;
CREATE TRIGGER trg_avaliacoes_biu
BEFORE INSERT OR UPDATE ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.processar_avaliacao();

DROP TRIGGER IF EXISTS trg_avaliacoes_ad ON public.avaliacoes;
CREATE TRIGGER trg_avaliacoes_ad
AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.processar_avaliacao();

-- updated_at
DROP TRIGGER IF EXISTS trg_avaliacoes_updated_at ON public.avaliacoes;
CREATE TRIGGER trg_avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
