-- Admin-only controls for editing user dashboard financial values.
-- Authorization is based on the existing user_roles table and has_role() helper.

CREATE POLICY "admins can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "admins can read portfolios"
ON public.portfolio
FOR SELECT
TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "admins can update portfolios"
ON public.portfolio
FOR UPDATE
TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'::public.app_role)))
WITH CHECK ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

CREATE INDEX IF NOT EXISTS user_roles_user_id_role_idx
ON public.user_roles (user_id, role);

CREATE INDEX IF NOT EXISTS portfolio_user_id_idx
ON public.portfolio (user_id);
