-- TradeNova AI: secure admin user/role management.
-- The first authenticated user to call bootstrap_first_admin() becomes the initial admin.
-- After that, only admins can grant/revoke admin or moderator roles.

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

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  country text,
  role public.app_role
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.email, p.country, COALESCE(ur.role, 'user'::public.app_role)
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY lower(COALESCE(p.full_name, '')), lower(p.email);
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  target_user_id uuid,
  new_role public.app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  admin_count integer;
BEGIN
  IF current_user_id IS NULL OR NOT public.has_role(current_user_id, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF target_user_id = current_user_id AND new_role <> 'admin' THEN
    RAISE EXCEPTION 'El administrador principal no puede quitarse sus propios permisos desde este panel';
  END IF;

  IF new_role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role IN ('moderator', 'user');
    RETURN true;
  END IF;

  IF new_role = 'moderator' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'moderator')
    ON CONFLICT (user_id, role) DO NOTHING;
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role IN ('admin', 'user');
    RETURN true;
  END IF;

  IF new_role = 'user' THEN
    SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') AND admin_count <= 1 THEN
      RAISE EXCEPTION 'Debe existir al menos un administrador';
    END IF;

    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role IN ('admin', 'moderator');
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;

  RAISE EXCEPTION 'Rol no permitido';
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;
