export function formatCurrency(value: number | null | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export function formatSignedCurrency(value: number | null | undefined, currency = "USD") {
  const n = Number(value ?? 0);
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatCurrency(n, currency)}`;
}

export function formatPercent(value: number | null | undefined, digits = 2) {
  const n = Number(value ?? 0);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
