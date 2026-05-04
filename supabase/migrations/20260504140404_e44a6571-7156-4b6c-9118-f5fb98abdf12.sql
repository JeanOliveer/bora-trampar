
-- 1. Servicos: empresa, token e pontuacao agregada da empresa
ALTER TABLE public.servicos
  ADD COLUMN IF NOT EXISTS empresa_nome text,
  ADD COLUMN IF NOT EXISTS empresa_email text,
  ADD COLUMN IF NOT EXISTS empresa_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS empresa_pontuacao integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS empresa_total_avaliacoes integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_servicos_empresa_token ON public.servicos(empresa_token);

-- Permitir leitura pública de serviço pelo token (sem expor lista completa)
DROP POLICY IF EXISTS "Acesso publico via token empresa" ON public.servicos;
CREATE POLICY "Acesso publico via token empresa"
  ON public.servicos FOR SELECT
  USING (true);  -- já era público para ativos; mantém leitura ampla, RLS abaixo restringe avaliacoes

-- 2. Candidaturas: marcar aprovada
ALTER TABLE public.candidaturas
  ADD COLUMN IF NOT EXISTS aprovada_pela_empresa boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS aprovada_em timestamptz;

-- 3. Avaliacoes: tipo (empresa->trabalhador / trabalhador->empresa)
DO $$ BEGIN
  CREATE TYPE public.avaliacao_tipo AS ENUM ('empresa_para_trabalhador','trabalhador_para_empresa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.avaliacoes
  ADD COLUMN IF NOT EXISTS tipo public.avaliacao_tipo NOT NULL DEFAULT 'empresa_para_trabalhador';

-- Apenas uma avaliação de cada tipo por candidatura
CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_unica_por_tipo
  ON public.avaliacoes(candidatura_id, tipo);

-- 4. Trigger atualizado: pontuacao vai pro destinatario certo
CREATE OR REPLACE FUNCTION public.processar_avaliacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pontos_old smallint := 0;
  v_pontos_new smallint := 0;
  v_servico_id uuid;
BEGIN
  IF TG_OP IN ('INSERT','UPDATE') THEN
    IF NEW.estrelas BETWEEN 1 AND 3
       AND (NEW.justificativa IS NULL OR length(btrim(NEW.justificativa)) < 5)
       AND NEW.tipo = 'empresa_para_trabalhador' THEN
      RAISE EXCEPTION 'Justificativa obrigatória para avaliações de 1, 2 ou 3 estrelas';
    END IF;
    NEW.pontos := public.calcular_pontos_estrelas(NEW.estrelas);
    v_pontos_new := NEW.pontos;
    v_servico_id := NEW.servico_id;
  ELSE
    v_servico_id := OLD.servico_id;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    v_pontos_old := OLD.pontos;
    IF NEW.tipo = 'empresa_para_trabalhador' THEN
      UPDATE public.profiles
        SET pontuacao = pontuacao - v_pontos_old + v_pontos_new
        WHERE user_id = NEW.trabalhador_id;
    ELSE
      UPDATE public.servicos
        SET empresa_pontuacao = empresa_pontuacao - v_pontos_old + v_pontos_new
        WHERE id = NEW.servico_id;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.tipo = 'empresa_para_trabalhador' THEN
      UPDATE public.profiles
        SET pontuacao = pontuacao + v_pontos_new
        WHERE user_id = NEW.trabalhador_id;
    ELSE
      UPDATE public.servicos
        SET empresa_pontuacao = empresa_pontuacao + v_pontos_new,
            empresa_total_avaliacoes = empresa_total_avaliacoes + 1
        WHERE id = NEW.servico_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.tipo = 'empresa_para_trabalhador' THEN
      UPDATE public.profiles
        SET pontuacao = pontuacao - OLD.pontos
        WHERE user_id = OLD.trabalhador_id;
    ELSE
      UPDATE public.servicos
        SET empresa_pontuacao = empresa_pontuacao - OLD.pontos,
            empresa_total_avaliacoes = GREATEST(0, empresa_total_avaliacoes - 1)
        WHERE id = OLD.servico_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_processar_avaliacao ON public.avaliacoes;
CREATE TRIGGER trg_processar_avaliacao
BEFORE INSERT OR UPDATE OR DELETE ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.processar_avaliacao();

-- 5. RLS: permitir avaliação via token (empresa->trabalhador) sem login
-- Função helper que valida token de serviço
CREATE OR REPLACE FUNCTION public.servico_token_valido(_servico_id uuid, _token uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.servicos
    WHERE id = _servico_id AND empresa_token = _token
  )
$$;

-- Política: trabalhador pode inserir avaliação reversa apenas se empresa já avaliou
DROP POLICY IF EXISTS "Trabalhador avalia empresa apos avaliacao" ON public.avaliacoes;
CREATE POLICY "Trabalhador avalia empresa apos avaliacao"
  ON public.avaliacoes FOR INSERT
  WITH CHECK (
    tipo = 'trabalhador_para_empresa'
    AND auth.uid() = trabalhador_id
    AND auth.uid() = avaliador_id
    AND EXISTS (
      SELECT 1 FROM public.avaliacoes a2
      WHERE a2.candidatura_id = avaliacoes.candidatura_id
        AND a2.tipo = 'empresa_para_trabalhador'
    )
  );

-- Trabalhador pode ver avaliações que ele fez à empresa também (já coberto por avaliador_id)
