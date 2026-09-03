-- TradeNova AI — Phase 3 foundation for a future LIVE execution layer.
-- LIVE trading remains disabled. These controls are persisted server-side so a
-- future execution service can enforce them before submitting any real order.

CREATE TABLE IF NOT EXISTS public.risk_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  max_position_usd numeric NOT NULL DEFAULT 250,
  max_daily_loss_usd numeric NOT NULL DEFAULT 100,
  max_open_positions integer NOT NULL DEFAULT 3,
  max_drawdown_pct numeric NOT NULL DEFAULT 10,
  kill_switch boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.risk_controls TO authenticated;
GRANT ALL ON public.risk_controls TO service_role;
ALTER TABLE public.risk_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "risk controls own" ON public.risk_controls;
CREATE POLICY "risk controls own" ON public.risk_controls
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.risk_controls
  DROP CONSTRAINT IF EXISTS risk_controls_values_valid;
ALTER TABLE public.risk_controls
  ADD CONSTRAINT risk_controls_values_valid CHECK (
    max_position_usd > 0
    AND max_daily_loss_usd > 0
    AND max_open_positions BETWEEN 1 AND 100
    AND max_drawdown_pct > 0
    AND max_drawdown_pct <= 100
  );

CREATE OR REPLACE FUNCTION public.validate_risk_controls()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL OR NEW.user_id <> COALESCE(OLD.user_id, NEW.user_id) THEN
    RAISE EXCEPTION 'Usuario de controles de riesgo inválido';
  END IF;
  IF NEW.max_position_usd <= 0 OR NEW.max_daily_loss_usd <= 0 THEN
    RAISE EXCEPTION 'Los límites monetarios deben ser mayores que cero';
  END IF;
  IF NEW.max_open_positions < 1 OR NEW.max_open_positions > 100 THEN
    RAISE EXCEPTION 'El número de posiciones abiertas debe estar entre 1 y 100';
  END IF;
  IF NEW.max_drawdown_pct <= 0 OR NEW.max_drawdown_pct > 100 THEN
    RAISE EXCEPTION 'El drawdown máximo debe estar entre 0 y 100';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_risk_controls ON public.risk_controls;
CREATE TRIGGER validate_risk_controls
  BEFORE INSERT OR UPDATE ON public.risk_controls
  FOR EACH ROW EXECUTE FUNCTION public.validate_risk_controls();

-- Global execution gate. Only trusted server-side execution can change it.
CREATE TABLE IF NOT EXISTS public.trading_runtime (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  live_enabled boolean NOT NULL DEFAULT false,
  global_kill_switch boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.trading_runtime (id, live_enabled, global_kill_switch)
VALUES (true, false, true)
ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON public.trading_runtime FROM anon, authenticated;
GRANT SELECT ON public.trading_runtime TO service_role;
GRANT ALL ON public.trading_runtime TO service_role;
ALTER TABLE public.trading_runtime ENABLE ROW LEVEL SECURITY;

-- A future execution function should require BOTH gates plus user risk controls.
-- Keep the public client unable to activate LIVE through direct table writes.
COMMENT ON TABLE public.trading_runtime IS 'Server-controlled execution gate. LIVE intentionally disabled until a real execution service is deployed.';
COMMENT ON TABLE public.risk_controls IS 'Per-user server-enforced risk limits for future LIVE execution.';
