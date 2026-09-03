-- Trade Nova AI — Phase 2 security/data-integrity hardening.
-- User accounts must never be able to manufacture financial balances,
-- completed deposits/withdrawals, or arbitrary operation results from the client.

-- PORTFOLIO: read-only for end users. Creation/financial mutations are server/admin responsibilities.
DROP POLICY IF EXISTS "portfolio own" ON public.portfolio;
CREATE POLICY "portfolio read own" ON public.portfolio
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.portfolio FROM authenticated;

-- OPERATIONS: read-only for end users. Trading engines/server-side jobs own the ledger.
DROP POLICY IF EXISTS "operations own" ON public.operations;
CREATE POLICY "operations read own" ON public.operations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.operations FROM authenticated;

-- DEPOSITS: users may create requests, but only as PENDING and only for themselves.
DROP POLICY IF EXISTS "deposits own" ON public.deposits;
CREATE POLICY "deposits read own" ON public.deposits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "deposits create pending" ON public.deposits
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND amount > 0
    AND lower(status) = 'pending'
    AND length(trim(method)) BETWEEN 2 AND 40
  );
REVOKE UPDATE, DELETE ON public.deposits FROM authenticated;

-- WITHDRAWALS: users may create requests, but only as PENDING and only for themselves.
DROP POLICY IF EXISTS "withdrawals own" ON public.withdrawals;
CREATE POLICY "withdrawals read own" ON public.withdrawals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "withdrawals create pending" ON public.withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND amount > 0
    AND lower(status) = 'pending'
    AND length(trim(method)) BETWEEN 2 AND 40
    AND length(trim(destination)) BETWEEN 2 AND 500
  );
REVOKE UPDATE, DELETE ON public.withdrawals FROM authenticated;

-- ROBOT: keep user configuration writable, but enforce safe values at the database boundary.
CREATE OR REPLACE FUNCTION public.validate_robot_configuration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL OR NEW.user_id <> COALESCE(OLD.user_id, NEW.user_id) THEN
    RAISE EXCEPTION 'Usuario del robot inválido';
  END IF;

  IF NEW.capital_allocation IS NULL OR NEW.capital_allocation < 0 THEN
    RAISE EXCEPTION 'El capital asignado no puede ser negativo';
  END IF;

  IF NEW.mode NOT IN ('DEMO', 'LIVE') THEN
    RAISE EXCEPTION 'Modo de robot inválido';
  END IF;

  -- LIVE execution is intentionally unavailable in this version.
  IF NEW.mode = 'LIVE' AND lower(NEW.status) IN ('active', 'running', 'enabled') THEN
    RAISE EXCEPTION 'El modo LIVE todavía no está disponible';
  END IF;

  IF NEW.markets IS NULL OR cardinality(NEW.markets) < 1 THEN
    RAISE EXCEPTION 'Debe existir al menos un mercado seleccionado';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_robot_configuration ON public.robots;
CREATE TRIGGER validate_robot_configuration
  BEFORE INSERT OR UPDATE ON public.robots
  FOR EACH ROW EXECUTE FUNCTION public.validate_robot_configuration();

-- NOTIFICATIONS: users can read and mark their own notifications as read,
-- but cannot manufacture/delete system notifications.
DROP POLICY IF EXISTS "notifications own" ON public.notifications;
CREATE POLICY "notifications read own" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notifications mark own read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_read = true);
REVOKE INSERT, DELETE ON public.notifications FROM authenticated;

CREATE OR REPLACE FUNCTION public.protect_notification_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id
     OR NEW.type <> OLD.type
     OR NEW.title <> OLD.title
     OR NEW.message <> OLD.message
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Solo se puede marcar una notificación como leída';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_notification_fields ON public.notifications;
CREATE TRIGGER protect_notification_fields
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.protect_notification_fields();

-- SETTINGS: restrict persisted language to the application's supported languages.
ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_language_supported;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_language_supported CHECK (language IN ('es', 'en'));

ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_currency_supported;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_currency_supported CHECK (currency IN ('USD', 'BRL', 'EUR'));

ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_theme_supported;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_theme_supported CHECK (theme IN ('dark', 'light', 'system'));

-- Explicitly keep administrative financial RPC execution limited to signed-in users.
REVOKE ALL ON FUNCTION public.admin_update_portfolio(uuid, numeric, numeric, numeric, numeric, numeric, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_portfolio(uuid, numeric, numeric, numeric, numeric, numeric, numeric) TO authenticated;
