CREATE TABLE public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('food', 'personal-care')),
  ingredient_text text NOT NULL,
  results jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.scans.user_id IS 'Owner of the scan; set from the authenticated session server-side, never from client input';
COMMENT ON COLUMN public.scans.results IS 'Structured analysis results; null until analysis is connected';

GRANT SELECT, INSERT, DELETE ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own scans"
  ON public.scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON public.scans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);