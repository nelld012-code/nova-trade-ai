import { MockTradingService } from "./MockTradingService";
import type { TradingService } from "./types";

/**
 * DEMO and REAL trading are intentionally separated. Only the demo engine is
 * wired in this version; a live implementation must be registered explicitly.
 */
const registry: Partial<Record<"DEMO" | "REAL", TradingService>> = {
  DEMO: new MockTradingService(),
};

export function getTradingService(environment: "DEMO" | "REAL" = "DEMO"): TradingService {
  const service = registry[environment];
  if (!service) {
    throw new Error(`Trading environment "${environment}" is not available in this version.`);
  }
  return service;
}

export * from "./types";
export { MockTradingService, buildDemoCandles } from "./MockTradingService";
