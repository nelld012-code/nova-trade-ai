-- Automatic DEMO risk notifications after server-side portfolio changes.
-- No client can invoke the trigger directly; it runs only after a portfolio UPDATE.

CREATE OR REPLACE FUNCTION public.trg_portfolio_risk_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_risk_alert_if_needed(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portfolio_risk_alert_after_update ON public.portfolio;
CREATE TRIGGER portfolio_risk_alert_after_update
AFTER UPDATE OF today_pnl, performance_pct, invested ON public.portfolio
FOR EACH ROW
WHEN (
  NEW.today_pnl IS DISTINCT FROM OLD.today_pnl
  OR NEW.performance_pct IS DISTINCT FROM OLD.performance_pct
  OR NEW.invested IS DISTINCT FROM OLD.invested
)
EXECUTE FUNCTION public.trg_portfolio_risk_alert();

REVOKE ALL ON FUNCTION public.trg_portfolio_risk_alert() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.trg_portfolio_risk_alert() IS 'Server-side hook that creates deduplicated DEMO risk notifications after portfolio changes.';
