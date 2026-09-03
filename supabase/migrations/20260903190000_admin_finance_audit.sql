-- Trade Nova AI: administrator financial review + immutable audit trail.
-- These functions are server-side controls; client users cannot approve or reject requests.

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (length(trim(action)) BETWEEN 2 AND 80),
  entity text NOT NULL CHECK (length(trim(entity)) BETWEEN 2 AND 80),
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_idx ON public.admin_audit_log(target_user_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read audit log" ON public.admin_audit_log;
CREATE POLICY "Admins can read audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE INSERT, UPDATE, DELETE ON public.admin_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

CREATE OR REPLACE FUNCTION public.admin_update_portfolio(
  target_user_id uuid,
  new_balance numeric,
  new_invested numeric,
  new_total_deposited numeric,
  new_today_pnl numeric,
  new_total_pnl numeric,
  new_performance_pct numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_values jsonb;
  after_values jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF target_user_id IS NULL THEN RAISE EXCEPTION 'Usuario inválido'; END IF;
  IF new_balance IS NULL OR new_invested IS NULL OR new_total_deposited IS NULL
     OR new_today_pnl IS NULL OR new_total_pnl IS NULL OR new_performance_pct IS NULL THEN
    RAISE EXCEPTION 'Todos los valores son obligatorios';
  END IF;
  IF new_balance < 0 OR new_invested < 0 OR new_total_deposited < 0 THEN
    RAISE EXCEPTION 'Patrimonio, capital invertido y total depositado no pueden ser negativos';
  END IF;

  SELECT jsonb_build_object('balance', balance, 'invested', invested, 'total_deposited', total_deposited,
    'today_pnl', today_pnl, 'total_pnl', total_pnl, 'performance_pct', performance_pct)
  INTO before_values FROM public.portfolio WHERE user_id = target_user_id FOR UPDATE;
  IF before_values IS NULL THEN RAISE EXCEPTION 'No existe un portafolio para el usuario seleccionado'; END IF;

  UPDATE public.portfolio SET balance = new_balance, invested = new_invested,
    total_deposited = new_total_deposited, today_pnl = new_today_pnl,
    total_pnl = new_total_pnl, performance_pct = new_performance_pct, updated_at = now()
  WHERE user_id = target_user_id;

  after_values := jsonb_build_object('balance', new_balance, 'invested', new_invested,
    'total_deposited', new_total_deposited, 'today_pnl', new_today_pnl,
    'total_pnl', new_total_pnl, 'performance_pct', new_performance_pct);

  INSERT INTO public.admin_audit_log(actor_user_id, target_user_id, action, entity, before_data, after_data)
  VALUES (auth.uid(), target_user_id, 'portfolio_update', 'portfolio', before_values, after_values);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_deposit(request_id uuid, decision text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r record; p record; before_values jsonb; after_values jsonb; d text := lower(trim(decision));
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF d NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Decisión inválida'; END IF;
  SELECT id,user_id,amount,status,method INTO r FROM public.deposits WHERE id=request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitud de depósito no encontrada'; END IF;
  IF lower(r.status) <> 'pending' THEN RAISE EXCEPTION 'La solicitud ya fue procesada'; END IF;

  IF d='approved' THEN
    SELECT balance,invested,total_deposited,today_pnl,total_pnl,performance_pct INTO p FROM public.portfolio WHERE user_id=r.user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'El usuario no tiene portafolio'; END IF;
    before_values := jsonb_build_object('balance',p.balance,'total_deposited',p.total_deposited);
    UPDATE public.portfolio SET balance=balance+r.amount,total_deposited=total_deposited+r.amount,updated_at=now() WHERE user_id=r.user_id;
    after_values := jsonb_build_object('balance',p.balance+r.amount,'total_deposited',p.total_deposited+r.amount);
  END IF;
  UPDATE public.deposits SET status=d WHERE id=request_id;
  INSERT INTO public.admin_audit_log(actor_user_id,target_user_id,action,entity,entity_id,before_data,after_data)
  VALUES(auth.uid(),r.user_id,'deposit_'||d,'deposit',r.id,
    jsonb_build_object('status',r.status,'amount',r.amount,'method',r.method,'portfolio',before_values),
    jsonb_build_object('status',d,'amount',r.amount,'method',r.method,'portfolio',after_values));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_withdrawal(request_id uuid, decision text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r record; p record; before_values jsonb; after_values jsonb; d text := lower(trim(decision));
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF d NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Decisión inválida'; END IF;
  SELECT id,user_id,amount,status,method,destination INTO r FROM public.withdrawals WHERE id=request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitud de retiro no encontrada'; END IF;
  IF lower(r.status) <> 'pending' THEN RAISE EXCEPTION 'La solicitud ya fue procesada'; END IF;

  IF d='approved' THEN
    SELECT balance,invested,total_deposited INTO p FROM public.portfolio WHERE user_id=r.user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'El usuario no tiene portafolio'; END IF;
    IF p.balance < r.amount THEN RAISE EXCEPTION 'Fondos insuficientes para aprobar el retiro'; END IF;
    before_values := jsonb_build_object('balance',p.balance);
    UPDATE public.portfolio SET balance=balance-r.amount,updated_at=now() WHERE user_id=r.user_id;
    after_values := jsonb_build_object('balance',p.balance-r.amount);
  END IF;
  UPDATE public.withdrawals SET status=d WHERE id=request_id;
  INSERT INTO public.admin_audit_log(actor_user_id,target_user_id,action,entity,entity_id,before_data,after_data)
  VALUES(auth.uid(),r.user_id,'withdrawal_'||d,'withdrawal',r.id,
    jsonb_build_object('status',r.status,'amount',r.amount,'method',r.method,'destination',r.destination,'portfolio',before_values),
    jsonb_build_object('status',d,'amount',r.amount,'method',r.method,'destination',r.destination,'portfolio',after_values));
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_deposit(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_review_withdrawal(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_deposit(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid,text) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_update_portfolio(uuid,numeric,numeric,numeric,numeric,numeric,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_portfolio(uuid,numeric,numeric,numeric,numeric,numeric) TO authenticated;

COMMENT ON TABLE public.admin_audit_log IS 'Immutable server-created audit trail for privileged financial and administrative actions.';
