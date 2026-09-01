import type {
  AccountBalance,
  MarketCandle,
  MarketData,
  OpenPositionInput,
  Position,
  TradingService,
} from "./types";

/** Deterministic pseudo-random so demo charts stay stable between renders. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export function buildDemoCandles(symbol: string, points = 60, base = 100): MarketCandle[] {
  const rand = seeded(symbol.length * 977 + points);
  let price = base;
  const candles: MarketCandle[] = [];
  for (let i = 0; i < points; i += 1) {
    const drift = (rand() - 0.45) * base * 0.02;
    const open = price;
    const close = Math.max(base * 0.4, open + drift);
    candles.push({
      time: `T-${points - i}`,
      open,
      close,
      high: Math.max(open, close) * (1 + rand() * 0.006),
      low: Math.min(open, close) * (1 - rand() * 0.006),
    });
    price = close;
  }
  return candles;
}

export class MockTradingService implements TradingService {
  readonly environment = "DEMO" as const;
  private positions: Position[] = [];

  async getMarketData(symbol: string): Promise<MarketData> {
    const candles = buildDemoCandles(symbol);
    const first = candles[0]!.close;
    const last = candles[candles.length - 1]!.close;
    return {
      symbol,
      price: last,
      changePct: ((last - first) / first) * 100,
      volatilityPct: 1.8,
      candles,
    };
  }

  async getBalance(): Promise<AccountBalance> {
    return { currency: "USD", available: 0, invested: 0 };
  }

  async getPositions(): Promise<Position[]> {
    return this.positions;
  }

  async openPosition(input: OpenPositionInput): Promise<Position> {
    const market = await this.getMarketData(input.symbol);
    const position: Position = {
      id: crypto.randomUUID(),
      symbol: input.symbol,
      direction: input.direction,
      size: input.size,
      entryPrice: market.price,
      markPrice: market.price,
      unrealizedPnl: 0,
    };
    this.positions = [...this.positions, position];
    return position;
  }

  async closePosition(positionId: string) {
    const position = this.positions.find((p) => p.id === positionId);
    this.positions = this.positions.filter((p) => p.id !== positionId);
    return { id: positionId, realizedPnl: position?.unrealizedPnl ?? 0 };
  }
}
