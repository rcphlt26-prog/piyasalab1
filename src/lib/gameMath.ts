import { getMarketPriceMeta, marketSymbolByCode } from "@/data/marketSymbols";

export const GAME_START_CASH = 100000;
export const GAME_MAX_ASSETS = 20;

export type GameOrderLike = { symbol: string; side: "BUY" | "SELL"; quantity: number | string };

export function isGameAsset(code: string) {
  const symbol = marketSymbolByCode.get(code);
  return Boolean(symbol) && symbol?.category !== "endeks";
}

export function holdingsFromOrders(orders: GameOrderLike[]) {
  const holdings = new Map<string, number>();
  for (const order of orders) {
    const quantity = Number(order.quantity);
    holdings.set(order.symbol, (holdings.get(order.symbol) ?? 0) + (order.side === "BUY" ? quantity : -quantity));
  }
  for (const [symbol, quantity] of holdings) if (quantity <= 1e-9) holdings.delete(symbol);
  return holdings;
}

/** Fiyatı oyun para birimi olan TL'ye çevirir (kripto ve yabancı hisseler USD fiyatlıdır). */
export function toTry(code: string, nativePrice: number, usdTry: number) {
  return getMarketPriceMeta(marketSymbolByCode.get(code)).currency === "USD" ? nativePrice * usdTry : nativePrice;
}

/** Yuvarlama aşağı yapılır; böylece harcanan tutar hiçbir zaman istenen tutarı aşmaz. */
export const floorQuantity = (value: number) => Math.floor(value * 1e8) / 1e8;
