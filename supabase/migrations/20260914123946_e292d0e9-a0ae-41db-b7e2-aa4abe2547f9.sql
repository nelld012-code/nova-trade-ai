CREATE OR REPLACE FUNCTION public.demo_get_equity_history(range_days integer)
RETURNS TABLE(equity numeric, today_pnl numeric, total_pnl numeric, created_at timestamptz)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT s.equity, s.today_pnl, s.total_pnl, s.created_at
    FROM public.demo_equity_snapshots s
    WHERE s.user_id = auth.uid()
      AND s.created_at >= now() - make_interval(days => LEAST(GREATEST(range_days, 1), 365))
  ), ranked AS (
    SELECT f.*,
      row_number() OVER (ORDER BY f.created_at) AS row_number,
      count(*) OVER () AS total_rows
    FROM filtered f
  )
  SELECT r.equity, r.today_pnl, r.total_pnl, r.created_at
  FROM ranked r
  WHERE r.row_number = 1
     OR r.row_number = r.total_rows
     OR mod(r.row_number - 1, GREATEST(CEIL(r.total_rows / 498.0)::bigint, 1)) = 0
  ORDER BY r.created_at;
$$;
REVOKE ALL ON FUNCTION public.demo_get_equity_history(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.demo_get_equity_history(integer) TO authenticated;
COMMENT ON FUNCTION public.demo_get_equity_history(integer) IS 'Returns an authenticated user own DEMO equity history, downsampled without fabricated values.';