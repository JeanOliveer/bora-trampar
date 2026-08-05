CREATE TYPE public.notificacao_tipo AS ENUM (
  'nova_diaria',
  'candidatura_aceita',
  'candidatura_recusada',
  'mensagem_empresa',
  'servico_iniciado',
  'servico_finalizado',
  'avaliacao_recebida',
  'conta_atualizada',
  'aviso_importante'
);

CREATE TABLE public.notificacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tipo public.notificacao_tipo NOT NULL DEFAULT 'aviso_importante',
  titulo text NOT NULL,
  descricao text,
  rota text,
  entidade_id uuid,
  lida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve suas notificacoes"
  ON public.notificacoes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuario atualiza suas notificacoes"
  ON public.notificacoes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario remove suas notificacoes"
  ON public.notificacoes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_notificacoes_user_created ON public.notificacoes (user_id, created_at DESC);
CREATE INDEX idx_notificacoes_user_lida ON public.notificacoes (user_id, lida);

CREATE TRIGGER trg_notificacoes_updated_at
  BEFORE UPDATE ON public.notificacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Novo serviço publicado -> notifica trabalhadores da mesma cidade (ou todos se serviço sem cidade)
CREATE OR REPLACE FUNCTION public.notificar_novo_servico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ativo IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notificacoes (user_id, tipo, titulo, descricao, rota, entidade_id)
  SELECT p.user_id,
         'nova_diaria',
         'Nova diária disponível',
         'Uma nova vaga de ' || COALESCE(NEW.titulo, 'diária') || ' foi publicada' ||
           CASE WHEN NEW.cidade IS NOT NULL
                THEN ' em ' || NEW.cidade || COALESCE(' - ' || NEW.estado, '')
                ELSE '' END || '.',
         '/servicos?servico=' || NEW.id::text,
         NEW.id
  FROM public.profiles p
  WHERE NEW.cidade IS NULL
     OR p.cidade IS NULL
     OR lower(btrim(p.cidade)) = lower(btrim(NEW.cidade));

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_novo_servico
  AFTER INSERT ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.notificar_novo_servico();

-- Mudanças na candidatura -> notifica o trabalhador
CREATE OR REPLACE FUNCTION public.notificar_candidatura()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_titulo_servico text;
BEGIN
  SELECT titulo INTO v_titulo_servico FROM public.servicos WHERE id = NEW.servico_id;

  IF NEW.status = 'aprovada' AND COALESCE(OLD.status, '') <> 'aprovada' THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, descricao, rota, entidade_id)
    VALUES (NEW.user_id, 'candidatura_aceita', 'Candidatura aceita',
            'Sua candidatura para ' || COALESCE(v_titulo_servico, 'a vaga') || ' foi aceita.',
            '/servicos?candidatura=' || NEW.id::text, NEW.id);
  END IF;

  IF NEW.status = 'rejeitada' AND COALESCE(OLD.status, '') <> 'rejeitada' THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, descricao, rota, entidade_id)
    VALUES (NEW.user_id, 'candidatura_recusada', 'Candidatura recusada',
            'Sua candidatura para ' || COALESCE(v_titulo_servico, 'a vaga') || ' não foi aprovada desta vez.',
            '/servicos?candidatura=' || NEW.id::text, NEW.id);
  END IF;

  IF NEW.chegada_confirmada_em IS NOT NULL AND OLD.chegada_confirmada_em IS NULL THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, descricao, rota, entidade_id)
    VALUES (NEW.user_id, 'servico_iniciado', 'Serviço iniciado',
            'Sua chegada foi confirmada em ' || COALESCE(v_titulo_servico, 'seu serviço') || '. Bom trabalho!',
            '/servicos?candidatura=' || NEW.id::text, NEW.id);
  END IF;

  IF NEW.expediente_encerrado_em IS NOT NULL AND OLD.expediente_encerrado_em IS NULL THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, descricao, rota, entidade_id)
    VALUES (NEW.user_id, 'servico_finalizado', 'Serviço finalizado',
            'O expediente de ' || COALESCE(v_titulo_servico, 'seu serviço') || ' foi encerrado.',
            '/servicos?candidatura=' || NEW.id::text, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_candidatura
  AFTER UPDATE ON public.candidaturas
  FOR EACH ROW EXECUTE FUNCTION public.notificar_candidatura();

-- Avaliação recebida -> notifica o trabalhador
CREATE OR REPLACE FUNCTION public.notificar_avaliacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo = 'empresa_para_trabalhador' THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, descricao, rota, entidade_id)
    VALUES (NEW.trabalhador_id, 'avaliacao_recebida', 'Avaliação recebida',
            'Você recebeu uma avaliação de ' || NEW.estrelas::text || ' estrela(s).',
            '/carreira', NEW.candidatura_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_avaliacao
  AFTER INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.notificar_avaliacao();