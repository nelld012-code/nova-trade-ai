import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, YAxis } from "recharts";
import { Activity, Bot, ShieldCheck, TrendingUp } from "lucide-react";
import { buildDemoCandles } from "@/services/trading";

const candles = buildDemoCandles("BTCUSD", 34, 120);
const equity = candles.map((c, i) => ({ i, value: c.close }));
const volume = candles.slice(-18).map((c, i) => ({ i, value: Math.abs(c.close - c.open) + 1 }));

/** Illustrative market visual — demo data, not a real trading result. */
export function HeroPanel() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] hero-glow blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl bg-gradient-navy p-5 shadow-[var(--shadow-lift)] ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-cyan">
              <Bot className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy-foreground">TRADE NOVA ENGINE</p>
              <p className="text-[11px] text-white/50">Datos de demostración</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-profit/15 px-2.5 py-1 text-[11px] font-bold text-profit">
            <span className="size-1.5 rounded-full bg-profit" /> ACTIVO
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-white/40">BTC / USD</p>
              <p className="mt-1 text-2xl font-extrabold text-navy-foreground">
                {candles[candles.length - 1]!.close.toFixed(2)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-profit">
              <TrendingUp className="size-3.5" /> tendencia detectada
            </span>
          </div>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-cyan)"
                  strokeWidth={2}
                  fill="url(#heroArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume}>
                <Bar dataKey="value" fill="var(--color-primary)" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Activity, label: "Señales", value: "18" },
            { icon: TrendingUp, label: "Volatilidad", value: "1.8%" },
            { icon: ShieldCheck, label: "Riesgo", value: "MEDIO" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
              <Icon className="size-4 text-cyan" />
              <p className="mt-2 text-xs text-white/50">{label}</p>
              <p className="text-sm font-bold text-navy-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
