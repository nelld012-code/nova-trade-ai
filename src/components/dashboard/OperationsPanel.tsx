import { ArrowDownRight, ArrowUpRight, Clock3, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Operation = {
  id: string;
  asset: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  pnl: number;
  return_pct: number;
  size: number;
  status: string;
  opened_at: string;
  closed_at: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("open") || normalized.includes("active")) return "Abierta";
  if (normalized.includes("close") || normalized.includes("complete")) return "Cerrada";
  return status;
}

export function OperationsPanel({ operations }: { operations: Operation[] }) {
  return (
    <Card id="operaciones" className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Operaciones</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Historial reciente de actividad del robot.</p>
        </div>
        <History className="h-5 w-5 text-blue-600" />
      </CardHeader>
      <CardContent>
        {operations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-medium">Aún no hay operaciones</p>
            <p className="mt-1 text-sm text-slate-500">Cuando el robot genere operaciones, aparecerán aquí con su resultado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Activo</th><th className="pb-3 font-medium">Dirección</th><th className="pb-3 font-medium">Entrada</th><th className="pb-3 font-medium">Salida</th><th className="pb-3 font-medium">Tamaño</th><th className="pb-3 text-right font-medium">P&L</th><th className="pb-3 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => {
                  const buy = op.direction.toLowerCase() === "buy" || op.direction.toLowerCase() === "long";
                  return (
                    <tr key={op.id} className="border-b last:border-0">
                      <td className="py-4"><p className="font-semibold text-slate-900">{op.asset}</p><p className="text-xs text-slate-500">{date(op.opened_at)}</p></td>
                      <td className="py-4"><span className={`inline-flex items-center gap-1 font-medium ${buy ? "text-emerald-600" : "text-red-600"}`}>{buy ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{op.direction}</span></td>
                      <td className="py-4">{money(op.entry_price)}</td>
                      <td className="py-4">{op.exit_price == null ? "—" : money(op.exit_price)}</td>
                      <td className="py-4">{op.size}</td>
                      <td className={`py-4 text-right font-semibold ${op.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}><div>{op.pnl >= 0 ? "+" : ""}{money(op.pnl)}</div><div className="text-xs font-normal text-slate-500">{op.return_pct >= 0 ? "+" : ""}{op.return_pct.toFixed(2)}%</div></td>
                      <td className="py-4 text-right"><Badge variant={statusLabel(op.status) === "Cerrada" ? "secondary" : "outline"}>{statusLabel(op.status)}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
