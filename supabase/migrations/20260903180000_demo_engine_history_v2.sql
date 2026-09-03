-- DEMO engine v2: persistent synthetic market state + equity history.
-- DEMO ONLY. No live exchange, broker, or LIVE order execution is enabled.

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
  v_open_count integer := 0;
  v_asset text;
  v_direction text;
  v_entry numeric;
  v_exit numeric;
  v_price numeric;
  v_size numeric;
  v_return_pct numeric := 0;
  v_pnl numeric := 0;
  v_today_pnl numeric := 0;
  v_total_pnl numeric := 0;
  v_closed_id uuid;
  v_opened_id uuid;
  v_base numeric;
  v_move numeric;
  v_max_size numeric;
  v_size_multiplier numeric;
  v_available_exposure numeric;
  v_now timestamptz := now();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_robot FROM public.robots WHERE user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Robot configuration not found'; END IF;
  IF upper(coalesce(v_robot.mode, 'DEMO')) <> 'DEMO' THEN RAISE EXCEPTION 'DEMO execution requires DEMO mode'; END IF;
  IF lower(coalesce(v_robot.status, '')) NOT IN ('active','running') THEN RAISE EXCEPTION 'Robot is not active'; END IF;
  INSERT INTO public.risk_controls (user_id) VALUES (v_user) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_risk FROM public.risk_controls WHERE user_id = v_user FOR UPDATE;
  IF v_risk.kill_switch THEN RAISE EXCEPTION 'Risk kill switch is enabled'; END IF;
  SELECT * INTO v_portfolio FROM public.portfolio WHERE user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Portfolio not found'; END IF;

  v_today_pnl := CASE
    WHEN v_portfolio.updated_at IS NULL OR (v_portfolio.updated_at AT TIME ZONE 'UTC')::date < (v_now AT TIME ZONE 'UTC')::date THEN 0
    ELSE coalesce(v_portfolio.today_pnl, 0)
  END;
  IF v_today_pnl <= -abs(v_risk.max_daily_loss_usd) THEN RAISE EXCEPTION 'Daily loss limit reached'; END IF;

  SELECT count(*) INTO v_open_count FROM public.operations WHERE user_id = v_user AND upper(status) = 'OPEN';

  -- Close the oldest open DEMO position using a persistent synthetic price.
  SELECT id, asset, direction, entry_price, size INTO v_closed_id, v_asset, v_direction, v_entry, v_size
  FROM public.operations WHERE user_id = v_user AND upper(status) = 'OPEN'
  ORDER BY opened_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED;

  IF v_closed_id IS NOT NULL THEN
    v_base := CASE v_asset WHEN 'BTC/USD' THEN 65000 WHEN 'ETH/USD' THEN 3200 WHEN 'EUR/USD' THEN 1.08 WHEN 'XAU/USD' THEN 2350 ELSE 100 END;
    INSERT INTO public.demo_market_state(user_id, asset, price) VALUES (v_user, v_asset, v_base) ON CONFLICT (user_id, asset) DO NOTHING;
    SELECT price INTO v_price FROM public.demo_market_state WHERE user_id = v_user AND asset = v_asset FOR UPDATE;
    v_move := (random() - 0.48) * CASE upper(coalesce(v_robot.risk_level, 'MEDIUM')) WHEN 'LOW' THEN 0.006 WHEN 'BAJO' THEN 0.006 WHEN 'HIGH' THEN 0.016 WHEN 'ALTO' THEN 0.016 ELSE 0.010 END;
    v_price := round((v_price * (1 + v_move))::numeric, 8);
    IF v_price <= 0 THEN v_price := v_base; END IF;
    UPDATE public.demo_market_state SET price = v_price, updated_at = v_now WHERE user_id = v_user AND asset = v_asset;
    v_exit := v_price;
    v_return_pct := CASE WHEN upper(v_direction) IN ('LONG','BUY') THEN ((v_exit-v_entry)/NULLIF(v_entry,0))*100 ELSE ((v_entry-v_exit)/NULLIF(v_entry,0))*100 END;
    v_pnl := round(v_size * v_return_pct / 100, 2);
    UPDATE public.operations SET exit_price=v_exit, pnl=v_pnl, return_pct=v_return_pct, status='CLOSED', closed_at=v_now WHERE id=v_closed_id;
    v_today_pnl := v_today_pnl + v_pnl;
    v_total_pnl := coalesce(v_portfolio.total_pnl,0) + v_pnl;
    UPDATE public.portfolio SET balance=greatest(0,coalesce(balance,0)+v_pnl), today_pnl=v_today_pnl, total_pnl=v_total_pnl,
      performance_pct=CASE WHEN coalesce(total_deposited,0)>0 THEN (v_total_pnl/total_deposited)*100 ELSE 0 END,
      invested=(SELECT coalesce(sum(size),0) FROM public.operations WHERE user_id=v_user AND upper(status)='OPEN'), updated_at=v_now
    WHERE user_id=v_user;
    v_open_count := greatest(0,v_open_count-1);
  END IF;

  -- Re-read after settlement so exposure is calculated from current equity/exposure.
  SELECT * INTO v_portfolio FROM public.portfolio WHERE user_id=v_user FOR UPDATE;
  v_available_exposure := greatest(0, coalesce(v_portfolio.balance,0) - coalesce(v_portfolio.invested,0));
  v_max_size := least(abs(v_risk.max_position_usd), greatest(0,coalesce(v_robot.capital_allocation,0)), v_available_exposure);
  v_size_multiplier := CASE upper(coalesce(v_robot.risk_level,'MEDIUM')) WHEN 'LOW' THEN 0.35 WHEN 'BAJO' THEN 0.35 WHEN 'HIGH' THEN 0.80 WHEN 'ALTO' THEN 0.80 ELSE 0.55 END;
  v_size := round(least(v_max_size, v_max_size * v_size_multiplier)::numeric,2);

  IF v_open_count < v_risk.max_open_positions AND v_today_pnl > -abs(v_risk.max_daily_loss_usd) AND v_size > 0 THEN
    v_asset := coalesce(v_robot.markets[1],'BTC/USD');
    IF v_asset='BTC' THEN v_asset='BTC/USD'; END IF;
    IF v_asset='ETH' THEN v_asset='ETH/USD'; END IF;
    v_base := CASE v_asset WHEN 'BTC/USD' THEN 65000 WHEN 'ETH/USD' THEN 3200 WHEN 'EUR/USD' THEN 1.08 WHEN 'XAU/USD' THEN 2350 ELSE 100 END;
    INSERT INTO public.demo_market_state(user_id, asset, price) VALUES (v_user, v_asset, v_base) ON CONFLICT (user_id, asset) DO NOTHING;
    SELECT price INTO v_price FROM public.demo_market_state WHERE user_id=v_user AND asset=v_asset FOR UPDATE;
    v_move := (random()-0.48) * 0.004;
    v_price := round((v_price * (1+v_move))::numeric,8);
    IF v_price <= 0 THEN v_price := v_base; END IF;
    UPDATE public.demo_market_state SET price=v_price, updated_at=v_now WHERE user_id=v_user AND asset=v_asset;
    v_direction := CASE WHEN random()>=0.5 THEN 'LONG' ELSE 'SHORT' END;
    v_entry := v_price;
    INSERT INTO public.operations(user_id,asset,direction,entry_price,size,pnl,return_pct,status,opened_at)
    VALUES(v_user,v_asset,v_direction,v_entry,v_size,0,0,'OPEN',v_now) RETURNING id INTO v_opened_id;
    UPDATE public.portfolio SET invested=(SELECT coalesce(sum(size),0) FROM public.operations WHERE user_id=v_user AND upper(status)='OPEN'), updated_at=v_now WHERE user_id=v_user;
  END IF;

  SELECT * INTO v_portfolio FROM public.portfolio WHERE user_id=v_user;
  v_total_pnl := coalesce(v_portfolio.total_pnl,0);
  v_today_pnl := coalesce(v_portfolio.today_pnl,0);
  INSERT INTO public.demo_equity_snapshots(user_id,equity,today_pnl,total_pnl,invested,open_positions,created_at)
  VALUES(v_user,greatest(0,coalesce(v_portfolio.balance,0)),v_today_pnl,v_total_pnl,greatest(0,coalesce(v_portfolio.invested,0)),
    (SELECT count(*) FROM public.operations WHERE user_id=v_user AND upper(status)='OPEN'),v_now);

  RETURN jsonb_build_object('ok',true,'mode','DEMO','closed_operation_id',v_closed_id,'opened_operation_id',v_opened_id,
    'realized_pnl',round(coalesce(v_pnl,0),2),'today_pnl',round(v_today_pnl,2),'total_pnl',round(v_total_pnl,2),
    'equity',round(greatest(0,coalesce(v_portfolio.balance,0)),2),'market_price',v_price,'asset',v_asset,
    'open_positions',(SELECT count(*) FROM public.operations WHERE user_id=v_user AND upper(status)='OPEN'),'max_open_positions',v_risk.max_open_positions);
END;
$$;
REVOKE ALL ON FUNCTION public.demo_execute_tick() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.demo_execute_tick() TO authenticated;
