CREATE OR REPLACE FUNCTION public.trg_portfolio_risk_alert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM public.create_risk_alert_if_needed(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portfolio_risk_alert_trigger ON public.portfolio;
CREATE TRIGGER portfolio_risk_alert_trigger
AFTER UPDATE OF balance, today_pnl, total_pnl, performance_pct, invested
ON public.portfolio
FOR EACH ROW
WHEN (NEW.today_pnl IS DISTINCT FROM OLD.today_pnl OR NEW.performance_pct IS DISTINCT FROM OLD.performance_pct OR NEW.invested IS DISTINCT FROM OLD.invested)
EXECUTE FUNCTION public.trg_portfolio_risk_alert();
