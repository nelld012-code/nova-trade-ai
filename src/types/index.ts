export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type RobotStatus = "ACTIVE" | "PAUSED";
export type RobotMode = "CONSERVATIVE" | "BALANCED" | "ACTIVE";
export type MarketKey = "BTC" | "ETH" | "FOREX" | "INDICES" | "STOCKS";
export type OperationStatus = "OPEN" | "WON" | "LOST" | "CLOSED";
export type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";

export type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  min_investment: number;
  risk_level: string;
  strategy: string;
  features: string[];
  support: string;
  ai_robot_access: string;
  is_popular: boolean;
  sort_order: number;
};

export type PlatformMetric = {
  id: string;
  key: string;
  label: string;
  value: string;
  hint: string;
  sort_order: number;
};

export type Portfolio = {
  balance: number;
  invested: number;
  total_deposited: number;
  today_pnl: number;
  total_pnl: number;
  performance_pct: number;
};

export type Robot = {
  id: string;
  user_id: string;
  status: RobotStatus | string;
  strategy: string;
  risk_level: string;
  markets: string[];
  mode: string;
  capital_allocation: number;
};

export type Operation = {
  id: string;
  asset: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  size: number;
  pnl: number;
  return_pct: number;
  status: string;
  opened_at: string;
  closed_at: string | null;
};
