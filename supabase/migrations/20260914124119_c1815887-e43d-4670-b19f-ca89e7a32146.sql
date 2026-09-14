REVOKE ALL ON TABLE public.admin_audit_log FROM anon, authenticated;
REVOKE ALL ON TABLE public.trading_runtime FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.create_risk_alert_if_needed(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_risk_alert_if_needed(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.admin_exists() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_audit_log() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_chat_messages(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_financial_requests() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_portfolio(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_risk_controls(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_review_deposit(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_review_withdrawal(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_send_support_message(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid,public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_portfolio(uuid,numeric,numeric,numeric,numeric,numeric,numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_upsert_risk_controls(uuid,numeric,numeric,integer,numeric,boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.demo_execute_tick() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_audit_log() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_chat_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_financial_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_portfolio(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_risk_controls(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_deposit(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_send_support_message(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_portfolio(uuid,numeric,numeric,numeric,numeric,numeric,numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_risk_controls(uuid,numeric,numeric,integer,numeric,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.demo_execute_tick() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;