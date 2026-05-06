ALTER TABLE public.candidaturas
  ADD COLUMN IF NOT EXISTS checkin_em timestamptz,
  ADD COLUMN IF NOT EXISTS checkin_lat numeric,
  ADD COLUMN IF NOT EXISTS checkin_lng numeric,
  ADD COLUMN IF NOT EXISTS presenca_confirmada_em timestamptz;

-- Permitir que o trabalhador faça seu próprio check-in
CREATE POLICY "Trabalhador faz checkin"
ON public.candidaturas
FOR UPDATE
USING (auth.uid() = user_id AND status = 'aprovada')
WITH CHECK (auth.uid() = user_id);