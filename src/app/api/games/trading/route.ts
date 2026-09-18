import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { marketSymbolByCode } from "@/data/marketSymbols";

const INITIAL_CASH = 100000;
const yahoo = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

type Order = { symbol: string; side: "BUY" | "SELL"; quantity: number; execution_price: number };

async function context() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, userId: null };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, userId: null };
  const { data: appUser } = await supabase.from("app_users").select("id").eq("supabase_user_id", auth.user.id).single();
  return { supabase, userId: appUser?.id ?? null };
}

async function prices(symbols: string[]) {
  const yahooSymbols = symbols.map((symbol) => marketSymbolByCode.get(symbol)?.yahooSymbol).filter(Boolean) as string[];
  if (!yahooSymbols.length) return new Map<string, number>();
  const result = await yahoo.quote([...new Set(yahooSymbols)]);
  const rows = Array.isArray(result) ? result : [result];
  const byYahoo = new Map(rows.map((row) => [row.symbol, Number(row.regularMarketPrice ?? 0)]));
  return new Map(symbols.map((symbol) => [symbol, byYahoo.get(marketSymbolByCode.get(symbol)?.yahooSymbol ?? "") ?? 0]));
}

function holdings(orders: Order[]) {
  const map = new Map<string, number>();
  for (const order of orders) {
    const next = (map.get(order.symbol) ?? 0) + (order.side === "BUY" ? order.quantity : -order.quantity);
    map.set(order.symbol, next);
  }
  return map;
}

async function refreshValue(supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>, portfolioId: string, cashBalance: number, orders: Order[]) {
  const positions = holdings(orders);
  const priceMap = await prices(Array.from(positions.keys()));
  const currentValue = cashBalance + Array.from(positions.entries()).reduce((sum, [symbol, quantity]) => sum + Math.max(0, quantity) * (priceMap.get(symbol) ?? 0), 0);
  const totalReturnPct = ((currentValue / INITIAL_CASH) - 1) * 100;
  await supabase.from("game_portfolios").update({ current_value: currentValue, total_return_pct: totalReturnPct, updated_at: new Date().toISOString() }).eq("id", portfolioId);
  return { currentValue, totalReturnPct, positions, priceMap };
}

export async function GET(request: Request) {
  const period = new URL(request.url).searchParams.get("period") === "monthly" ? "monthly" : "weekly";
  const { supabase, userId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });

  const since = new Date();
  since.setDate(since.getDate() - (period === "monthly" ? 31 : 7));
  const { data: leaderboard, error } = await supabase.from("game_portfolios").select("display_name, current_value, total_return_pct, updated_at").gte("updated_at", since.toISOString()).order("total_return_pct", { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: "Leaderboard alınamadı." }, { status: 500 });

  let portfolio = null;
  if (userId) {
    const { data } = await supabase.from("game_portfolios").select("id, display_name, initial_cash, cash_balance, current_value, total_return_pct, started_at, updated_at, game_orders(symbol, side, quantity, execution_price, created_at)").eq("user_id", userId).maybeSingle();
    portfolio = data;
  }
  return NextResponse.json({ period, leaderboard: leaderboard ?? [], portfolio });
}

export async function POST(request: Request) {
  const { supabase, userId } = await context();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oyuna katılmak için giriş yapın." }, { status: 401 });
  const body = (await request.json()) as { action?: "start" | "trade"; displayName?: string; symbol?: string; side?: "BUY" | "SELL"; quantity?: number };

  let { data: portfolio } = await supabase.from("game_portfolios").select("id, display_name, initial_cash, cash_balance, current_value, total_return_pct, started_at, updated_at").eq("user_id", userId).maybeSingle();
  if (body.action === "start") {
    if (!portfolio) {
      const { data, error } = await supabase.from("game_portfolios").insert({ user_id: userId, display_name: body.displayName?.trim().slice(0, 30) || "Anonim Oyuncu" }).select("id, display_name, initial_cash, cash_balance, current_value, total_return_pct, started_at, updated_at").single();
      if (error) return NextResponse.json({ error: "Sanal portföy oluşturulamadı." }, { status: 500 });
      portfolio = data;
    }
    return NextResponse.json({ portfolio }, { status: 201 });
  }
  if (!portfolio || body.action !== "trade") return NextResponse.json({ error: "Önce sanal portföyü başlatın." }, { status: 400 });

  const symbol = body.symbol?.trim().toUpperCase();
  const side = body.side === "SELL" ? "SELL" : "BUY";
  const quantity = Number(body.quantity);
  const market = symbol ? marketSymbolByCode.get(symbol) : undefined;
  if (!symbol || !market || !Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Geçerli sembol ve miktar girin." }, { status: 400 });
  const priceMap = await prices([symbol]);
  const executionPrice = priceMap.get(symbol) ?? 0;
  if (!executionPrice) return NextResponse.json({ error: "Bu sembol için canlı fiyat alınamadı." }, { status: 503 });
  const { data: existingOrders } = await supabase.from("game_orders").select("symbol, side, quantity, execution_price").eq("portfolio_id", portfolio.id);
  const currentOrders = (existingOrders ?? []) as Order[];
  const currentHolding = holdings(currentOrders).get(symbol) ?? 0;
  if (side === "SELL" && quantity > currentHolding) return NextResponse.json({ error: "Bu miktarda pozisyonunuz yok." }, { status: 400 });
  const total = executionPrice * quantity;
  const nextCash = Number(portfolio.cash_balance) + (side === "BUY" ? -total : total);
  if (nextCash < 0) return NextResponse.json({ error: "Yeterli sanal nakit yok." }, { status: 400 });

  const { error: orderError } = await supabase.from("game_orders").insert({ portfolio_id: portfolio.id, symbol, side, quantity, execution_price: executionPrice });
  if (orderError) return NextResponse.json({ error: "İşlem kaydedilemedi." }, { status: 500 });
  const allOrders: Order[] = [...currentOrders, { symbol, side, quantity, execution_price: executionPrice }];
  const refreshed = await refreshValue(supabase, portfolio.id, nextCash, allOrders);
  await supabase.from("game_portfolios").update({ cash_balance: nextCash }).eq("id", portfolio.id);
  return NextResponse.json({ ok: true, executionPrice, cashBalance: nextCash, currentValue: refreshed.currentValue, totalReturnPct: refreshed.totalReturnPct });
}
