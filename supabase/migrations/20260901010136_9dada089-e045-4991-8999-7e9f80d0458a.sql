
-- helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- roles
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- plans (public)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  min_investment numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'LOW',
  strategy text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  support text NOT NULL DEFAULT '',
  ai_robot_access text NOT NULL DEFAULT '',
  is_popular boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read" ON public.plans FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.plans (slug,name,tagline,min_investment,risk_level,strategy,features,support,ai_robot_access,is_popular,sort_order) VALUES
('starter','NOVA STARTER','Primeros pasos con el motor de IA',250,'LOW','Conservadora · baja exposición','["Análisis de mercado 24/7","1 mercado activo","Reportes semanales","Modo demo ilimitado"]','Soporte por email','Motor IA básico',false,1),
('growth','NOVA GROWTH','El equilibrio entre control y automatización',1000,'MEDIUM','Balanceada · multi-activo','["Análisis de mercado 24/7","3 mercados activos","Reportes diarios","Alertas de riesgo","Curva de equity avanzada"]','Soporte prioritario','Motor IA completo',true,2),
('pro','NOVA PRO','Para operadores activos',5000,'MEDIUM','Activa · multi-estrategia','["Todos los mercados","Estrategias personalizadas","Backtesting","Panel de riesgo avanzado","Exportación de datos"]','Soporte 24/5','Motor IA Pro + parámetros',false,3),
('elite','NOVA ELITE','Máximo control y personalización',25000,'HIGH','Institucional · a medida','["Todos los mercados","Modelos dedicados","API privada","Gestor de cuenta","Informes institucionales"]','Soporte dedicado 24/7','Motor IA Elite + API',false,4);

-- platform metrics (public)
CREATE TABLE public.platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  value text NOT NULL,
  hint text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.platform_metrics TO anon, authenticated;
GRANT ALL ON public.platform_metrics TO service_role;
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics public read" ON public.platform_metrics FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.platform_metrics (key,label,value,hint,sort_order) VALUES
('realtime','Análisis en tiempo real','24/7','Monitoreo continuo de mercados',1),
('assets','Activos monitorizados','100+','Cripto, forex, índices y acciones',2),
('operations','Operaciones analizadas','1.2M','Datos de demostración',3),
('accuracy','Precisión del modelo','—','Datos de demostración',4);

-- robots
CREATE TABLE public.robots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PAUSED',
  strategy text NOT NULL DEFAULT 'growth',
  risk_level text NOT NULL DEFAULT 'MEDIUM',
  markets text[] NOT NULL DEFAULT ARRAY['BTC','ETH']::text[],
  mode text NOT NULL DEFAULT 'BALANCED',
  capital_allocation numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.robots TO authenticated;
GRANT ALL ON public.robots TO service_role;
ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "robots own" ON public.robots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER robots_updated_at BEFORE UPDATE ON public.robots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- operations
CREATE TABLE public.operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL,
  direction text NOT NULL DEFAULT 'LONG',
  entry_price numeric NOT NULL DEFAULT 0,
  exit_price numeric,
  size numeric NOT NULL DEFAULT 0,
  pnl numeric NOT NULL DEFAULT 0,
  return_pct numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'OPEN',
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operations TO authenticated;
GRANT ALL ON public.operations TO service_role;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operations own" ON public.operations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- deposits
CREATE TABLE public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'PIX',
  status text NOT NULL DEFAULT 'PENDING',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.deposits TO authenticated;
GRANT ALL ON public.deposits TO service_role;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deposits own" ON public.deposits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER deposits_updated_at BEFORE UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- withdrawals
CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'PIX',
  destination text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "withdrawals own" ON public.withdrawals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- portfolio
CREATE TABLE public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  invested numeric NOT NULL DEFAULT 0,
  total_deposited numeric NOT NULL DEFAULT 0,
  today_pnl numeric NOT NULL DEFAULT 0,
  total_pnl numeric NOT NULL DEFAULT 0,
  performance_pct numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.portfolio TO authenticated;
GRANT ALL ON public.portfolio TO service_role;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio own" ON public.portfolio FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER portfolio_updated_at BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- settings
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'es',
  currency text NOT NULL DEFAULT 'USD',
  theme text NOT NULL DEFAULT 'dark',
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT false,
  risk_alerts boolean NOT NULL DEFAULT true,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings own" ON public.settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'SYSTEM',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications own" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- bootstrap new users
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.portfolio (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.robots (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.id, 'SYSTEM', 'Bienvenido a TradeNova AI', 'Configura tu robot de IA para comenzar.');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
