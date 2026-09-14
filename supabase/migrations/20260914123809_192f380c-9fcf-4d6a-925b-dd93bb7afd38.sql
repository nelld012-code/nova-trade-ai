DROP POLICY IF EXISTS "risk controls own" ON public.risk_controls;
CREATE POLICY "risk controls read own" ON public.risk_controls FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.risk_controls FROM authenticated;
GRANT SELECT ON public.risk_controls TO authenticated;
GRANT ALL ON public.risk_controls TO service_role;