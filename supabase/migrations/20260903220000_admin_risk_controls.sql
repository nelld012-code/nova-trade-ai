-- Trade Nova AI: protect privileged risk-control changes and audit them.
CREATE OR REPLACE FUNCTION public.admin_upsert_risk_controls(
  target_user_id uuid,
  new_max_position_usd numeric,
  new_max_daily_loss_usd numeric,
  new_max_open_positions integer,
  new_max_drawdown_pct numeric,
  new_kill_switch boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE before_values jsonb; after_values jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF target_user_id IS NULL THEN RAISE EXCEPTION 'Usuario inválido'; END IF;
  IF new_max_position_usd <= 0 OR new_max_daily_loss_usd <= 0 OR new_max_open_positions NOT BETWEEN 1 AND 100 OR new_max_drawdown_pct <= 0 OR new_max_drawdown_pct > 100 THEN
    RAISE EXCEPTION 'Controles de riesgo inválidos';
  END IF;
  SELECT jsonb_build_object('max_position_usd',max_position_usd,'max_daily_loss_usd',max_daily_loss_usd,'max_open_positions',max_open_positions,'max_drawdown_pct',max_drawdown_pct,'kill_switch',kill_switch)
  INTO before_values FROM public.risk_controls WHERE user_id=target_user_id FOR UPDATE;
  INSERT INTO public.risk_controls(user_id,max_position_usd,max_daily_loss_usd,max_open_positions,max_drawdown_pct,kill_switch)
  VALUES(target_user_id,new_max_position_usd,new_max_daily_loss_usd,new_max_open_positions,new_max_drawdown_pct,new_kill_switch)
  ON CONFLICT(user_id) DO UPDATE SET max_position_usd=EXCLUDED.max_position_usd,max_daily_loss_usd=EXCLUDED.max_daily_loss_usd,max_open_positions=EXCLUDED.max_open_positions,max_drawdown_pct=EXCLUDED.max_drawdown_pct,kill_switch=EXCLUDED.kill_switch,updated_at=now();
  after_values:=jsonb_build_object('max_position_usd',new_max_position_usd,'max_daily_loss_usd',new_max_daily_loss_usd,'max_open_positions',new_max_open_positions,'max_drawdown_pct',new_max_drawdown_pct,'kill_switch',new_kill_switch);
  INSERT INTO public.admin_audit_log(actor_user_id,target_user_id,action,entity,before_data,after_data) VALUES(auth.uid(),target_user_id,'risk_controls_update','risk_controls',before_values,after_values);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_upsert_risk_controls(uuid,numeric,numeric,integer,numeric,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_risk_controls(uuid,numeric,numeric,integer,numeric,boolean) TO authenticated;
COMMENT ON FUNCTION public.admin_upsert_risk_controls IS 'Admin-only risk-control update with audit trail. LIVE execution remains separately gated.';
