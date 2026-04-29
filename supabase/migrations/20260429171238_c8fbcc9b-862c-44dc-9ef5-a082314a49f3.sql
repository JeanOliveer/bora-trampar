ALTER TABLE public.candidaturas
  ALTER COLUMN mensagem DROP NOT NULL,
  ALTER COLUMN disponibilidade DROP NOT NULL;