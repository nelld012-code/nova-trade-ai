REVOKE EXECUTE ON FUNCTION public.validate_risk_controls() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_portfolio_risk_alert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_risk_alert_if_needed(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;