-- 1) New signups: respect chosen account type and auto-grant contratante access
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_type public.user_type := 'trabalhador';
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', '') = 'contratante' THEN
    v_type := 'contratante';
  END IF;

  INSERT INTO public.profiles (user_id, user_type, nome_completo)
  VALUES (
    NEW.id,
    v_type,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', '')
  );

  IF v_type = 'contratante' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contratante')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) Keep role in sync whenever a profile is set/changed to contratante
CREATE OR REPLACE FUNCTION public.sincronizar_papel_contratante()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.user_type = 'contratante' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'contratante')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.sincronizar_papel_contratante() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_sincronizar_papel_contratante ON public.profiles;
CREATE TRIGGER trg_sincronizar_papel_contratante
AFTER INSERT OR UPDATE OF user_type ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_papel_contratante();

-- 3) Retroactive backfill for existing contratante accounts
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'contratante'::public.app_role
FROM public.profiles p
WHERE p.user_type = 'contratante'
ON CONFLICT (user_id, role) DO NOTHING;
