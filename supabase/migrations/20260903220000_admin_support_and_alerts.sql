-- Admin support reply: server-created assistant message, never writable by clients.
CREATE OR REPLACE FUNCTION public.admin_send_support_message(target_user_id uuid, message_content text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF target_user_id IS NULL OR length(trim(coalesce(message_content,''))) = 0 OR length(message_content) > 12000 THEN
    RAISE EXCEPTION 'Mensaje inválido';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  INSERT INTO public.ai_chat_messages(user_id, role, content)
  VALUES(target_user_id, 'assistant', trim(message_content));
  INSERT INTO public.admin_audit_log(actor_user_id,target_user_id,action,entity,after_data)
  VALUES(auth.uid(),target_user_id,'support_reply','ai_chat_messages',jsonb_build_object('content',left(trim(message_content),12000)));
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_send_support_message(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_send_support_message(uuid,text) TO authenticated;

-- Server-side risk alert helper. It is idempotent within a short window and
-- uses the existing notifications table without exposing inserts to clients.
CREATE OR REPLACE FUNCTION public.create_risk_alert_if_needed(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE p record; r record; alert_title text; alert_message text; alert_type text;
BEGIN
  SELECT * INTO p FROM public.portfolio WHERE user_id=target_user_id;
  SELECT * INTO r FROM public.risk_controls WHERE user_id=target_user_id;
  IF NOT FOUND THEN RETURN false; END IF;
  IF p.today_pnl <= -abs(r.max_daily_loss_usd) THEN
    alert_title := 'Límite de pérdida diaria alcanzado'; alert_message := 'El P&L diario DEMO alcanzó el límite configurado.'; alert_type := 'risk';
  ELSIF p.performance_pct <= -abs(r.max_drawdown_pct) THEN
    alert_title := 'Límite de drawdown alcanzado'; alert_message := 'El rendimiento acumulado DEMO alcanzó el drawdown máximo configurado.'; alert_type := 'risk';
  ELSIF (SELECT count(*) FROM public.operations WHERE user_id=target_user_id AND upper(status)='OPEN') >= r.max_open_positions THEN
    alert_title := 'Máximo de posiciones abiertas'; alert_message := 'El número de posiciones abiertas alcanzó el límite configurado.'; alert_type := 'risk';
  ELSE RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.notifications WHERE user_id=target_user_id AND title=alert_title AND created_at > now()-interval '30 minutes') THEN RETURN true; END IF;
  INSERT INTO public.notifications(user_id,title,message,type,is_read) VALUES(target_user_id,alert_title,alert_message,alert_type,false);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.create_risk_alert_if_needed(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_risk_alert_if_needed(uuid) TO authenticated;
