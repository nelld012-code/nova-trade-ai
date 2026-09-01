/**
 * Trading engine contract.
 *
 * This first version NEVER executes real financial orders. `MockTradingService`
 * powers demo data; a future `LiveTradingService` can implement the same
 * interface against a broker/exchange API without touching the UI layer.
 */
export type TradingEnvironment = "DEMO" | "REAL";

export type MarketCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketData = {
  symbol: string;
  price: number;
  changePct: number;
  volatilityPct: number;
  candles: MarketCandle[];
};

export type AccountBalance = {
  currency: string;
  available: number;
  invested: number;
};

export type Position = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
};

export type OpenPositionInput = {
  symbol: string;
  direction: "LONG" | "SHORT";
  size: number;
};

export interface TradingService {
  readonly environment: TradingEnvironment;
  getMarketData(symbol: string): Promise<MarketData>;
  getBalance(): Promise<AccountBalance>;
  getPositions(): Promise<Position[]>;
  openPosition(input: OpenPositionInput): Promise<Position>;
  closePosition(positionId: string): Promise<{ id: string; realizedPnl: number }>;
}
