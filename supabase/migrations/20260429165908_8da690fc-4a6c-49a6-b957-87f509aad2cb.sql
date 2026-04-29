
-- Tabela candidaturas
CREATE TABLE public.candidaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  telefone TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  disponibilidade TEXT NOT NULL,
  experiencia TEXT,
  documento_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (servico_id, user_id)
);

ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trabalhadores criam suas candidaturas"
ON public.candidaturas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trabalhadores veem suas candidaturas"
ON public.candidaturas FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam candidaturas"
ON public.candidaturas FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins removem candidaturas"
ON public.candidaturas FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_candidaturas_updated_at
BEFORE UPDATE ON public.candidaturas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validação backend: CPF e PIX devem coincidir com o profile
CREATE OR REPLACE FUNCTION public.validate_candidatura()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cpf TEXT;
  v_pix TEXT;
BEGIN
  SELECT cpf, chave_pix INTO v_cpf, v_pix
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF v_cpf IS NULL OR v_pix IS NULL THEN
    RAISE EXCEPTION 'Complete seu cadastro com CPF e chave PIX antes de se candidatar';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_candidatura_trigger
BEFORE INSERT ON public.candidaturas
FOR EACH ROW EXECUTE FUNCTION public.validate_candidatura();

-- Bucket privado para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-candidatura', 'documentos-candidatura', false);

CREATE POLICY "Usuário envia seu próprio documento"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentos-candidatura'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuário vê seus próprios documentos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos-candidatura'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admin gerencia documentos candidatura"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documentos-candidatura'
  AND has_role(auth.uid(), 'admin'::app_role)
);
