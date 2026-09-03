-- DEMO execution engine only. LIVE remains disabled by trading_runtime.
-- The function derives the caller from auth.uid(), never accepts a user id,
-- generates bounded simulated prices internally, applies risk controls, and
-- updates operations + portfolio in one transaction.

CREATE OR REPLACE FUNCTION public.demo_execute_tick()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_robot public.robots%ROWTYPE;
  v_risk public.risk_controls%ROWTYPE;
  v_portfolio public.portfolio%ROWTYPE;
  v_open_count integer;
  v_asset text;
  v_direction text;
  v_entry numeric;
  v_exit numeric;
  v_size numeric;
  v_return_pct numeric;
  v_pnl numeric;
  v_today_pnl numeric;
  v_total_pnl numeric;
  v_opened_id uuid;
  v_closed_id uuid;
  v_base numeric;
  v_move numeric;
  v_max_size numeric;
  v_now timestamptz := now();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_robot
  FROM public.robots
  WHERE user_id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Robot configuration not found';
  END IF;

  IF upper(coalesce(v_robot.mode, 'DEMO')) <> 'DEMO' THEN
    RAISE EXCEPTION 'DEMO execution requires DEMO mode';
  END IF;

  IF lower(coalesce(v_robot.status, '')) NOT IN ('active','running') THEN
    RAISE EXCEPTION 'Robot is not active';
  END IF;

  INSERT INTO public.risk_controls (user_id)
  VALUES (v_user)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_risk
  FROM public.risk_controls
  WHERE user_id = v_user
  FOR UPDATE;

  IF v_risk.kill_switch THEN
    RAISE EXCEPTION 'Risk kill switch is enabled';
  END IF;

  SELECT * INTO v_portfolio
  FROM public.portfolio
  WHERE user_id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Portfolio not found';
  END IF;

  SELECT count(*) INTO v_open_count
  FROM public.operations
  WHERE user_id = v_user AND upper(status) = 'OPEN';

  v_today_pnl := coalesce(v_portfolio.today_pnl, 0);
  IF v_today_pnl <= -abs(v_risk.max_daily_loss_usd) THEN
    RAISE EXCEPTION 'Daily loss limit reached';
  END IF;

  -- First settle the oldest open simulated position, if one exists.
  SELECT id, asset, direction, entry_price, size
  INTO v_closed_id, v_asset, v_direction, v_entry, v_size
  FROM public.operations
  WHERE user_id = v_user AND upper(status) = 'OPEN'
  ORDER BY opened_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_closed_id IS NOT NULL THEN
    v_base := CASE v_asset
      WHEN 'BTC/USD' THEN 65000
      WHEN 'ETH/USD' THEN 3200
      WHEN 'EUR/USD' THEN 1.08
      WHEN 'XAU/USD' THEN 2350
      ELSE 100
    END;
    v_move := (random() - 0.48) * CASE upper(coalesce(v_robot.risk_level, 'MEDIUM'))
      WHEN 'LOW' THEN 0.006
      WHEN 'BAJO' THEN 0.006
      WHEN 'HIGH' THEN 0.016
      WHEN 'ALTO' THEN 0.016
      ELSE 0.010
    END;
    v_exit := round((v_entry * (1 + CASE WHEN upper(v_direction) IN ('LONG','BUY') THEN v_move ELSE -v_move END))::numeric, 8);
    v_return_pct := CASE WHEN upper(v_direction) IN ('LONG','BUY')
      THEN ((v_exit - v_entry) / NULLIF(v_entry,0)) * 100
      ELSE ((v_entry - v_exit) / NULLIF(v_entry,0)) * 100 END;
    v_pnl := round(v_size * v_return_pct / 100, 2);

    UPDATE public.operations
    SET exit_price = v_exit,
        pnl = v_pnl,
        return_pct = v_return_pct,
        status = 'CLOSED',
        closed_at = v_now
    WHERE id = v_closed_id;

    v_today_pnl := v_today_pnl + v_pnl;
    v_total_pnl := coalesce(v_portfolio.total_pnl, 0) + v_pnl;
    UPDATE public.portfolio
    SET balance = greatest(0, coalesce(balance,0) + v_pnl),
        today_pnl = v_today_pnl,
        total_pnl = v_total_pnl,
        performance_pct = CASE WHEN coalesce(total_deposited,0) > 0
          THEN (v_total_pnl / total_deposited) * 100 ELSE 0 END,
        updated_at = v_now
    WHERE user_id = v_user;

    v_open_count := greatest(0, v_open_count - 1);
  END IF;

  -- Open a fresh bounded simulated position when capacity allows.
  IF v_open_count < v_risk.max_open_positions
     AND v_today_pnl > -abs(v_risk.max_daily_loss_usd) THEN
    v_asset := coalesce(v_robot.markets[1], 'BTC/USD');
    IF v_asset = 'BTC' THEN v_asset := 'BTC/USD'; END IF;
    IF v_asset = 'ETH' THEN v_asset := 'ETH/USD'; END IF;
    v_direction := CASE WHEN random() >= 0.5 THEN 'LONG' ELSE 'SHORT' END;
    v_base := CASE v_asset
      WHEN 'BTC/USD' THEN 65000
      WHEN 'ETH/USD' THEN 3200
      WHEN 'EUR/USD' THEN 1.08
      WHEN 'XAU/USD' THEN 2350
      ELSE 100
    END;
    v_entry := round((v_base * (0.995 + random()*0.01))::numeric, 8);
    v_max_size := least(abs(v_risk.max_position_usd), greatest(0, coalesce(v_robot.capital_allocation,0)), greatest(0, coalesce(v_portfolio.balance,0)));
    v_size := round(least(v_max_size, greatest(25, v_max_size * CASE upper(coalesce(v_robot.risk_level,'MEDIUM')) WHEN 'LOW' THEN 0.35 WHEN 'BAJO' THEN 0.35 WHEN 'HIGH' THEN 0.80 WHEN 'ALTO' THEN 0.80 ELSE 0.55 END))::numeric, 2);

    IF v_size > 0 THEN
      INSERT INTO public.operations (user_id, asset, direction, entry_price, size, pnl, return_pct, status, opened_at)
      VALUES (v_user, v_asset, v_direction, v_entry, v_size, 0, 0, 'OPEN', v_now)
      RETURNING id INTO v_opened_id;

      UPDATE public.portfolio
      SET invested = (SELECT coalesce(sum(size),0) FROM public.operations WHERE user_id=v_user AND upper(status)='OPEN'),
          updated_at = v_now
      WHERE user_id = v_user;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'mode', 'DEMO',
    'closed_operation_id', v_closed_id,
    'opened_operation_id', v_opened_id,
    'realized_pnl', round(coalesce(v_pnl,0),2),
    'today_pnl', round(coalesce(v_today_pnl,0),2),
    'open_positions', (SELECT count(*) FROM public.operations WHERE user_id=v_user AND upper(status)='OPEN'),
    'max_open_positions', v_risk.max_open_positions
  );
END;
$$;

REVOKE ALL ON FUNCTION public.demo_execute_tick() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.demo_execute_tick() TO authenticated;
