-- TradeNova AI: secure administrator portfolio updates.
-- Admins use this SECURITY DEFINER function so portfolio RLS remains user-scoped.
-- Also serializes first-admin bootstrap to prevent two concurrent users becoming admins.

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  admin_count integer;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Serialize the bootstrap check + insert. This prevents a race where two
  -- first callers both observe zero admins before either inserts its role.
  PERFORM pg_advisory_xact_lock(817263514);

  SELECT count(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  IF admin_count > 0 THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

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
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario inválido';
  END IF;

  IF new_balance IS NULL OR new_invested IS NULL OR new_total_deposited IS NULL
     OR new_today_pnl IS NULL OR new_total_pnl IS NULL OR new_performance_pct IS NULL THEN
    RAISE EXCEPTION 'Todos los valores son obligatorios';
  END IF;

  IF new_balance < 0 OR new_invested < 0 OR new_total_deposited < 0 THEN
    RAISE EXCEPTION 'Patrimonio, capital invertido y total depositado no pueden ser negativos';
  END IF;

  UPDATE public.portfolio
  SET balance = new_balance,
      invested = new_invested,
      total_deposited = new_total_deposited,
      today_pnl = new_today_pnl,
      total_pnl = new_total_pnl,
      performance_pct = new_performance_pct,
      updated_at = now()
  WHERE user_id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe un portafolio para el usuario seleccionado';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_portfolio(uuid, numeric, numeric, numeric, numeric, numeric, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_portfolio(uuid, numeric, numeric, numeric, numeric, numeric, numeric) TO authenticated;
