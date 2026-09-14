CREATE OR REPLACE FUNCTION public.admin_get_financial_requests()
RETURNS TABLE(id uuid, user_id uuid, kind text, amount numeric, method text, status text, destination text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
    SELECT d.id,d.user_id,'deposit'::text,d.amount,d.method,d.status,NULL::text,d.created_at FROM public.deposits d
    UNION ALL
    SELECT w.id,w.user_id,'withdrawal'::text,w.amount,w.method,w.status,w.destination,w.created_at FROM public.withdrawals w
    ORDER BY created_at DESC LIMIT 50;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_portfolio(target_user_id uuid)
RETURNS TABLE(balance numeric, invested numeric, total_deposited numeric, today_pnl numeric, total_pnl numeric, performance_pct numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF target_user_id IS NULL THEN RAISE EXCEPTION 'Usuario inválido'; END IF;
  RETURN QUERY SELECT p.balance,p.invested,p.total_deposited,p.today_pnl,p.total_pnl,p.performance_pct FROM public.portfolio p WHERE p.user_id=target_user_id LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_risk_controls(target_user_id uuid)
RETURNS TABLE(user_id uuid, max_position_usd numeric, max_daily_loss_usd numeric, max_open_positions integer, max_drawdown_pct numeric, kill_switch boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF target_user_id IS NULL THEN RAISE EXCEPTION 'Usuario inválido'; END IF;
  RETURN QUERY SELECT r.user_id,r.max_position_usd,r.max_daily_loss_usd,r.max_open_positions,r.max_drawdown_pct,r.kill_switch FROM public.risk_controls r WHERE r.user_id=target_user_id LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_audit_log()
RETURNS TABLE(id uuid, actor_user_id uuid, target_user_id uuid, action text, entity text, entity_id uuid, before_data jsonb, after_data jsonb, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY SELECT a.id,a.actor_user_id,a.target_user_id,a.action,a.entity,a.entity_id,a.before_data,a.after_data,a.created_at FROM public.admin_audit_log a ORDER BY a.created_at DESC LIMIT 50;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_financial_requests() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_portfolio(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_risk_controls(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_audit_log() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_financial_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_portfolio(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_risk_controls(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_audit_log() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_portfolio(uuid,numeric,numeric,numeric,numeric,numeric,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_portfolio(uuid,numeric,numeric,numeric,numeric,numeric,numeric) TO authenticated;

DROP POLICY IF EXISTS "admins can read deposits" ON public.deposits;
DROP POLICY IF EXISTS "admins can read withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "admins can read portfolios" ON public.portfolio;
DROP POLICY IF EXISTS "admins can update portfolios" ON public.portfolio;
DROP POLICY IF EXISTS "admins can read risk controls" ON public.risk_controls;
DROP POLICY IF EXISTS "Admins can read audit log" ON public.admin_audit_log;

COMMENT ON FUNCTION public.admin_get_financial_requests IS 'Admin-only read boundary for deposit and withdrawal review.';
COMMENT ON FUNCTION public.admin_get_portfolio IS 'Admin-only read boundary for one user portfolio.';
COMMENT ON FUNCTION public.admin_get_risk_controls IS 'Admin-only read boundary for one user risk controls.';
COMMENT ON FUNCTION public.admin_get_audit_log IS 'Admin-only read boundary for the immutable audit log.';