import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTryPrices } from "@/lib/gamePricing";
import { GAME_MAX_ASSETS, GAME_START_CASH, floorQuantity, holdingsFromOrders, isGameAsset } from "@/lib/gameMath";
import { containsProfanity } from "@/lib/contentModeration";

export const runtime = "nodejs";
export const maxDuration = 30;

type Order = { symbol: string; side: "BUY" | "SELL"; quantity: number | string; execution_price: number | string; created_at?: string };
type Row = {
  id: string;
  display_name: string;
  cash_balance: number | string;
  current_value: number | string;
  total_return_pct: number | string;
  started_at: string;
  status: "ACTIVE" | "REMOVED";
  game_orders?: Order[] | null;
};

const ORDER_COLUMNS = "symbol, side, quantity, execution_price";
const MIGRATION_HINT = "Oyun veritabanı güncellemesi gerekli: supabase/migrations içindeki 20261005_game_participant_status.sql ve 20261006_game_daily_entries.sql dosyalarını SQL Editor'de çalıştırın.";
const todayIstanbul = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
const PERIOD_DAYS = { weekly: 7, monthly: 31 } as const;
let lastPersistAt = 0;

async function context() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, userId: null, username: null, isAdmin: false };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, userId: null, username: null, isAdmin: false };
  const { data: appUser } = await supabase.from("app_users").select("id, role, username").eq("supabase_user_id", auth.user.id).maybeSingle();
  return { supabase, userId: appUser?.id ?? null, username: (appUser?.username as string | null) ?? null, isAdmin: appUser?.role === "ADMIN" };
}

/** Eksik fiyat durumunda varlık, son işlem fiyatıyla değerlenir; böylece geçici veri kesintisi puanı sıfırlamaz. */
function valuePortfolio(cash: number, orders: Order[], prices: Map<string, number>) {
  const holdings = holdingsFromOrders(orders);
  const lastPrice = new Map<string, number>();
  for (const order of orders) lastPrice.set(order.symbol, Number(order.execution_price));
  let value = cash;
  for (const [symbol, quantity] of holdings) value += quantity * (prices.get(symbol) ?? lastPrice.get(symbol) ?? 0);
  return { holdings, value, returnPct: (value / GAME_START_CASH - 1) * 100 };
}

async function persistValues(admin: SupabaseClient, rows: Array<{ id: string; value: number; pct: number }>) {
  const now = Date.now();
  if (!rows.length || now - lastPersistAt < 300_000) return;
  lastPersistAt = now;
  for (let index = 0; index < rows.length; index += 25) {
    await Promise.all(rows.slice(index, index + 25).map((row) =>
      admin.from("game_portfolios").update({ current_value: row.value, total_return_pct: row.pct, updated_at: new Date().toISOString() }).eq("id", row.id)));
  }
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const isMissingColumn = (error: { code?: string; message?: string } | null) => error?.code === "42703" || /status|removed_at|entry_day|is_admin_entry/.test(error?.message ?? "");

async function pricesForSymbols(orders: Order[]) {
  const symbols = Array.from(new Set(orders.map((order) => order.symbol)));
  if (!symbols.length) return new Map<string, number>();
  return getTryPrices(symbols).catch(() => new Map<string, number>());
}

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("period");
  const period = requested === "monthly" ? "monthly" : requested === "all" ? "all" : "weekly";
  const { supabase, userId, isAdmin } = await context();
  if (!supabase) return fail("Supabase yapılandırılmamış.", 503);

  // Servis anahtarı varsa tüm emirlerle canlı değerleme yapılır; yoksa kayıtlı değerler kullanılır.
  const admin = getSupabaseAdminClient();
  const reader = admin ?? supabase;
  const select = `id, display_name, cash_balance, current_value, total_return_pct, started_at, status${admin ? `, game_orders(${ORDER_COLUMNS})` : ""}${isAdmin ? ", app_users(username)" : ""}`;
  const { data, error } = await reader.from("game_portfolios").select(select).order("started_at", { ascending: false }).limit(200);
  if (error) return fail(isMissingColumn(error) ? MIGRATION_HINT : "Yarışma verisi alınamadı.", 500);
  const rows = (data ?? []) as unknown as Array<Row & { app_users?: { username?: string | null } | null }>;

  const prices = admin ? await pricesForSymbols(rows.flatMap((row) => row.game_orders ?? [])) : new Map<string, number>();
  const scored = rows.map((row) => {
    if (!admin) return { row, value: Number(row.current_value), pct: Number(row.total_return_pct) };
    const valued = valuePortfolio(Number(row.cash_balance), row.game_orders ?? [], prices);
    return { row, value: valued.value, pct: valued.returnPct };
  });

  const since = period === "all" ? null : new Date(Date.now() - PERIOD_DAYS[period] * 86_400_000);
  const leaderboard = scored
    .filter(({ row }) => row.status === "ACTIVE" && (!since || new Date(row.started_at) >= since))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 20)
    .map(({ row, value, pct }) => ({ display_name: row.display_name, current_value: value, total_return_pct: pct, started_at: row.started_at }));
  if (admin) await persistValues(admin, scored.filter(({ row }) => row.status === "ACTIVE").map(({ row, value, pct }) => ({ id: row.id, value, pct })));

  let portfolio = null;
  let canJoin = false;
  if (userId) {
    const own = await supabase.from("game_portfolios").select(`id, display_name, cash_balance, current_value, total_return_pct, started_at, status, entry_day, game_orders(${ORDER_COLUMNS}, created_at)`).eq("user_id", userId).order("started_at", { ascending: false }).limit(50);
    if (own.error) return fail(isMissingColumn(own.error) ? MIGRATION_HINT : "Portföy alınamadı.", 500);
    const mine = (own.data ?? []) as unknown as Array<Row & { entry_day: string }>;
    const row = mine.find((entry) => entry.status === "ACTIVE") ?? null;
    canJoin = isAdmin || !mine.some((entry) => entry.entry_day === todayIstanbul());
    if (row) {
      const orders = row.game_orders ?? [];
      const ownPrices = await pricesForSymbols(orders);
      const valued = valuePortfolio(Number(row.cash_balance), orders, ownPrices);
      portfolio = {
        id: row.id,
        display_name: row.display_name,
        status: row.status,
        cash_balance: Number(row.cash_balance),
        current_value: valued.value,
        total_return_pct: valued.returnPct,
        started_at: row.started_at,
        holdings: Array.from(valued.holdings, ([symbol, quantity]) => ({ symbol, quantity, price: ownPrices.get(symbol) ?? null })),
      };
    }
  }

  const participants = isAdmin
    ? scored.map(({ row, value, pct }) => ({ id: row.id, display_name: row.display_name, username: row.app_users?.username ?? null, status: row.status, current_value: value, total_return_pct: pct, started_at: row.started_at }))
    : undefined;
  return NextResponse.json({ period, leaderboard, portfolio, isAdmin, signedIn: Boolean(userId), canJoin, participants, updatedAt: new Date().toISOString() });
}

export async function DELETE(request: Request) {
  const { supabase, isAdmin } = await context();
  if (!supabase) return fail("Supabase yapılandırılmamış.", 503);
  if (!isAdmin) return fail("Bu işlem için yönetici yetkisi gerekir.", 403);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Geçerli yarışmacı kimliği gerekli.", 400);

  // Satır silinmez, REMOVED işaretlenir: geçmiş kayıt korunur; kullanıcı yeni günlerde yeniden katılabilir.
  const database = getSupabaseAdminClient() ?? supabase;
  const { data, error } = await database.from("game_portfolios").update({ status: "REMOVED", removed_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (error) return fail(isMissingColumn(error) ? MIGRATION_HINT : "Yarışmacı çıkarılamadı.", 500);
  if (!data) return fail("Yarışmacı bulunamadı.", 404);
  return NextResponse.json({ ok: true });
}

type JoinItem = { symbol?: unknown; amountTry?: unknown };
type PostBody = { action?: string; displayName?: unknown; items?: unknown; symbol?: unknown; mode?: unknown; amountTry?: unknown; all?: unknown };

const cleanSymbol = (value: unknown) => (typeof value === "string" ? value.trim().toUpperCase() : "");
const cleanAmount = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
};

type OwnRow = { id: string; display_name: string; cash_balance: number | string; status: "ACTIVE" | "REMOVED"; entry_day: string };

async function ownPortfolios(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from("game_portfolios").select("id, display_name, cash_balance, status, entry_day").eq("user_id", userId).order("started_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as OwnRow[];
  return { rows, portfolio: rows.find((row) => row.status === "ACTIVE") ?? null, removed: rows.some((row) => row.status === "REMOVED"), error };
}

async function joinRace(supabase: SupabaseClient, userId: string, username: string | null, isAdmin: boolean, body: PostBody) {
  const existing = await ownPortfolios(supabase, userId);
  if (existing.error) return fail(isMissingColumn(existing.error) ? MIGRATION_HINT : "Katılım durumu kontrol edilemedi.", 500);
  if (!isAdmin) {
    if (existing.rows.some((row) => row.entry_day === todayIstanbul())) return fail("Yarışmaya günde 1 kez katılabilirsin.", 409);
  }

  const displayName = (typeof body.displayName === "string" ? body.displayName.trim() : "") || username || "";
  if (displayName.length < 2 || displayName.length > 30) return fail("Oyuncu adı 2-30 karakter olmalıdır.", 400);
  if (containsProfanity(displayName)) return fail("Oyuncu adı uygun değil.", 400);

  if (!Array.isArray(body.items) || body.items.length === 0) return fail("Yarışa başlamak için en az bir varlık seçin.", 400);
  const wanted = new Map<string, number>();
  for (const item of body.items as JoinItem[]) {
    const symbol = cleanSymbol(item.symbol);
    const amount = cleanAmount(item.amountTry);
    if (!isGameAsset(symbol) || !(amount >= 100)) return fail("Seçimlerde geçersiz varlık veya tutar var (en az 100 TL).", 400);
    wanted.set(symbol, (wanted.get(symbol) ?? 0) + amount);
  }
  if (wanted.size > GAME_MAX_ASSETS) return fail(`En fazla ${GAME_MAX_ASSETS} farklı varlık seçebilirsiniz.`, 400);
  const total = Array.from(wanted.values()).reduce((sum, amount) => sum + amount, 0);
  if (total > GAME_START_CASH + 1e-6) return fail("Seçimler 100.000 TL sanal bütçeyi aşıyor.", 400);

  const prices = await getTryPrices(Array.from(wanted.keys())).catch(() => new Map<string, number>());
  const orders: Array<{ symbol: string; side: "BUY"; quantity: number; execution_price: number }> = [];
  for (const [symbol, amount] of wanted) {
    const price = prices.get(symbol);
    if (!price) return fail(`${symbol} için canlı fiyat alınamadı; seçimi kaldırıp tekrar deneyin.`, 503);
    const quantity = floorQuantity(amount / price);
    if (quantity <= 0) return fail(`${symbol} için tutar çok düşük.`, 400);
    orders.push({ symbol, side: "BUY", quantity, execution_price: price });
  }
  const spent = orders.reduce((sum, order) => sum + order.quantity * order.execution_price, 0);
  const cash = Math.max(0, GAME_START_CASH - spent);

  const { data: created, error: createError } = await supabase
    .from("game_portfolios")
    .insert({ user_id: userId, display_name: displayName, cash_balance: cash, current_value: GAME_START_CASH, total_return_pct: 0, initial_cash: GAME_START_CASH, entry_day: todayIstanbul(), is_admin_entry: isAdmin })
    .select("id")
    .single();
  if (createError || !created) return fail(createError?.code === "23505" ? "Yarışmaya günde 1 kez katılabilirsin." : "Yarışa katılım kaydedilemedi.", createError?.code === "23505" ? 409 : 500);

  const { error: orderError } = await supabase.from("game_orders").insert(orders.map((order) => ({ ...order, portfolio_id: created.id })));
  if (orderError) {
    await supabase.from("game_portfolios").delete().eq("id", created.id);
    return fail("Seçimler kaydedilemedi; katılım geri alındı, tekrar deneyin.", 500);
  }
  return NextResponse.json({ ok: true, cashBalance: cash }, { status: 201 });
}

async function adjustPosition(supabase: SupabaseClient, userId: string, body: PostBody) {
  const { portfolio, error: portfolioError } = await ownPortfolios(supabase, userId);
  if (portfolioError) return fail(isMissingColumn(portfolioError) ? MIGRATION_HINT : "Portföy alınamadı.", 500);
  if (!portfolio) return fail("Önce yarışa katılın.", 400);

  const symbol = cleanSymbol(body.symbol);
  const mode = body.mode === "REMOVE" ? "REMOVE" : body.mode === "ADD" ? "ADD" : null;
  const amount = cleanAmount(body.amountTry);
  const removeAll = body.all === true;
  if (!isGameAsset(symbol) || !mode) return fail("Geçerli varlık ve işlem seçin.", 400);
  if (!removeAll && !(amount > 0)) return fail("Geçerli bir tutar girin.", 400);

  const price = (await getTryPrices([symbol]).catch(() => new Map<string, number>())).get(symbol);
  if (!price) return fail("Bu varlık için canlı fiyat alınamadı.", 503);

  const { data: orderRows, error: ordersError } = await supabase.from("game_orders").select(ORDER_COLUMNS).eq("portfolio_id", portfolio.id);
  if (ordersError) return fail("Portföy emirleri alınamadı.", 500);
  const orders = (orderRows ?? []) as Order[];
  const holdings = holdingsFromOrders(orders);
  const held = holdings.get(symbol) ?? 0;
  const cash = Number(portfolio.cash_balance);

  let quantity: number;
  if (mode === "ADD") {
    if (amount > cash + 1e-6) return fail(`Yeterli nakit yok (kalan ${cash.toFixed(2)} TL).`, 400);
    if (!held && holdings.size >= GAME_MAX_ASSETS) return fail(`En fazla ${GAME_MAX_ASSETS} farklı varlık tutabilirsiniz.`, 400);
    quantity = floorQuantity(Math.min(amount, cash) / price);
  } else {
    if (!held) return fail("Bu varlık portföyünüzde yok.", 400);
    quantity = removeAll || amount >= held * price * 0.999 ? held : Math.min(held, floorQuantity(amount / price));
  }
  if (!(quantity > 0)) return fail("Tutar çok düşük.", 400);

  const value = quantity * price;
  const nextCash = mode === "ADD" ? Math.max(0, cash - value) : cash + value;

  // Nakit bakiyesi eski değerle eşleşirse güncellenir; eş zamanlı iki işlemin aynı bakiyeyi harcamasını engeller.
  const { data: locked, error: lockError } = await supabase.from("game_portfolios").update({ cash_balance: nextCash }).eq("id", portfolio.id).eq("cash_balance", portfolio.cash_balance).select("id").maybeSingle();
  if (lockError) return fail("İşlem kaydedilemedi.", 500);
  if (!locked) return fail("Aynı anda başka bir işlem yapıldı; lütfen tekrar deneyin.", 409);

  const order = { portfolio_id: portfolio.id, symbol, side: mode === "ADD" ? "BUY" : "SELL", quantity, execution_price: price };
  const { error: orderError } = await supabase.from("game_orders").insert(order);
  if (orderError) {
    await supabase.from("game_portfolios").update({ cash_balance: cash }).eq("id", portfolio.id).eq("cash_balance", nextCash);
    return fail("İşlem kaydedilemedi.", 500);
  }

  const allOrders: Order[] = [...orders, { symbol, side: order.side as "BUY" | "SELL", quantity, execution_price: price }];
  const valued = valuePortfolio(nextCash, allOrders, await pricesForSymbols(allOrders));
  await supabase.from("game_portfolios").update({ current_value: valued.value, total_return_pct: valued.returnPct, updated_at: new Date().toISOString() }).eq("id", portfolio.id);
  return NextResponse.json({ ok: true, executionPrice: price, quantity, cashBalance: nextCash, currentValue: valued.value, totalReturnPct: valued.returnPct });
}

export async function POST(request: Request) {
  const { supabase, userId, username, isAdmin } = await context();
  if (!supabase) return fail("Supabase yapılandırılmamış.", 503);
  if (!userId) return fail("Yarışa katılmak için giriş yapın.", 401);
  // Bakiye ve emirler yalnızca sunucuda yazılır; istemci doğrudan değiştiremez.
  const database = getSupabaseAdminClient();
  if (!database) return fail("Yarış şu anda kullanılamıyor (sunucu yapılandırması eksik).", 503);

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return fail("Geçersiz istek.", 400);
  }
  if (body.action === "join") return joinRace(database, userId, username, isAdmin, body);
  if (body.action === "adjust") return adjustPosition(database, userId, body);
  return fail("Geçersiz işlem.", 400);
}
