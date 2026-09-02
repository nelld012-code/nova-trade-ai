import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else await navigate({ to: "/dashboard" });
    setLoading(false);
  }

  return (
    <AuthShell title="Bienvenido de nuevo" description="Inicia sesión para entrar a tu plataforma TradeNova AI.">
      <form onSubmit={handleLogin} className="space-y-5">
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        <div className="space-y-2"><Label htmlFor="email">Correo electrónico</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" placeholder="tu@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></div>
        <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Contraseña</Label><Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">¿La olvidaste?</Link></div><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" className="pl-9 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar contraseña">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <Button type="submit" className="h-11 w-full" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Iniciando sesión...</> : "Iniciar sesión"}</Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">¿Aún no tienes una cuenta? <Link to="/register" className="font-semibold text-primary hover:underline">Crear cuenta</Link></p>
    </AuthShell>
  );
}
