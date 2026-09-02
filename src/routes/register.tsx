import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Chrome } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) setError(error.message);
    else if (data.session) await navigate({ to: "/dashboard" });
    else setMessage("Cuenta creada. Revisa tu correo para confirmar tu dirección antes de iniciar sesión.");
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell title="Crea tu cuenta" description="Comienza tu experiencia con TradeNova AI en pocos pasos.">
      <form onSubmit={handleRegister} className="space-y-5">
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        {message && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{message}</div>}
        <div className="space-y-2"><Label htmlFor="name">Nombre completo</Label><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="name" placeholder="Tu nombre" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} required /></div></div>
        <div className="space-y-2"><Label htmlFor="email">Correo electrónico</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" placeholder="tu@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></div>
        <div className="space-y-2"><Label htmlFor="password">Contraseña</Label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="password" type={show ? "text" : "password"} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className="pl-9 pr-10" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Mostrar contraseña">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <Button type="submit" className="h-11 w-full" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando cuenta...</> : "Crear cuenta"}</Button>
      </form>
      <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">O continúa con</span><div className="h-px flex-1 bg-border" /></div>
      <Button type="button" variant="outline" className="h-11 w-full" onClick={handleGoogle} disabled={googleLoading}>{googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />} Google</Button>
      <p className="mt-7 text-center text-sm text-muted-foreground">¿Ya tienes una cuenta? <Link to="/login" className="font-semibold text-primary hover:underline">Iniciar sesión</Link></p>
    </AuthShell>
  );
}
