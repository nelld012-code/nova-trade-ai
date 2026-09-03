-- DEMO market/history foundation.
-- These tables are intentionally server-written; they do not represent live exchange data.

CREATE TABLE IF NOT EXISTS public.demo_market_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, asset)
);

CREATE TABLE IF NOT EXISTS public.demo_equity_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equity numeric NOT NULL CHECK (equity >= 0),
  today_pnl numeric NOT NULL DEFAULT 0,
  total_pnl numeric NOT NULL DEFAULT 0,
  invested numeric NOT NULL DEFAULT 0 CHECK (invested >= 0),
  open_positions integer NOT NULL DEFAULT 0 CHECK (open_positions >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_market_state_user_asset_idx ON public.demo_market_state(user_id, asset);
CREATE INDEX IF NOT EXISTS demo_equity_snapshots_user_created_idx ON public.demo_equity_snapshots(user_id, created_at DESC);

ALTER TABLE public.demo_market_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_equity_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own demo market state" ON public.demo_market_state;
CREATE POLICY "Users can view own demo market state"
  ON public.demo_market_state FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own demo equity snapshots" ON public.demo_equity_snapshots;
CREATE POLICY "Users can view own demo equity snapshots"
  ON public.demo_equity_snapshots FOR SELECT TO authenticated
  USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.demo_market_state FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.demo_equity_snapshots FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.demo_market_state, public.demo_equity_snapshots TO authenticated;
GRANT ALL ON public.demo_market_state, public.demo_equity_snapshots TO service_role;

COMMENT ON TABLE public.demo_market_state IS 'Server-controlled synthetic DEMO prices. Never presented as live exchange prices.';
COMMENT ON TABLE public.demo_equity_snapshots IS 'Server-created DEMO equity history for charts and analytics.';
