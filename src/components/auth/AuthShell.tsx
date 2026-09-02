import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bot } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600"><Bot className="h-5 w-5" /></span>
            TRADE NOVA AI
          </Link>
          <div className="max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Intelligent Trading. Smarter Decisions.</p>
            <h2 className="text-4xl font-bold leading-tight">Tu próxima generación de trading inteligente empieza aquí.</h2>
            <p className="mt-5 text-slate-400">Accede a tu plataforma y gestiona tu experiencia TradeNova AI desde un solo lugar.</p>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} TradeNova AI</p>
        </div>

        <div className="flex items-center justify-center bg-background px-5 py-10 text-foreground sm:px-8">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
