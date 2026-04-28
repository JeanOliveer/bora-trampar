
-- 1. Remover campos de empresa da tabela profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS nome_empresa,
  DROP COLUMN IF EXISTS cnpj,
  DROP COLUMN IF EXISTS responsavel;

-- 2. Forçar todos os perfis para trabalhador e remover o tipo "empresa" do enum
UPDATE public.profiles SET user_type = 'trabalhador' WHERE user_type::text = 'empresa';

-- Recriar o enum apenas com 'trabalhador'
ALTER TYPE public.user_type RENAME TO user_type_old;
CREATE TYPE public.user_type AS ENUM ('trabalhador');
ALTER TABLE public.profiles
  ALTER COLUMN user_type DROP DEFAULT,
  ALTER COLUMN user_type TYPE public.user_type USING user_type::text::public.user_type,
  ALTER COLUMN user_type SET DEFAULT 'trabalhador';
DROP TYPE public.user_type_old;

-- Atualizar handle_new_user para sempre criar trabalhador
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, nome_completo)
  VALUES (
    NEW.id,
    'trabalhador',
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', '')
  );
  RETURN NEW;
END;
$function$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Sistema de papéis (separado para segurança)
CREATE TYPE public.app_role AS ENUM ('admin', 'trabalhador');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Usuários veem seus próprios papéis"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os papéis"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam papéis"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Tabela de serviços
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  valor NUMERIC(10,2),
  cidade TEXT,
  estado TEXT,
  data_servico DATE,
  requisitos TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver serviços ativos"
  ON public.servicos FOR SELECT
  USING (ativo = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins criam serviços"
  ON public.servicos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam serviços"
  ON public.servicos FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins removem serviços"
  ON public.servicos FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
