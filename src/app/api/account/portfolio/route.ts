import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function getAppUserId() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, userId: null };

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { supabase, userId: null };

  const { data: appUser, error: appUserError } = await supabase
    .from("app_users")
    .select("id")
    .eq("supabase_user_id", authData.user.id)
    .single();

  return { supabase, userId: appUserError ? null : appUser?.id ?? null };
}

export async function GET() {
  const { supabase, userId } = await getAppUserId();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const { data, error } = await supabase
    .from("portfolios")
    .select("id, name, created_at, portfolio_transactions(id, symbol, asset_type, buy_price, quantity, transaction_date, type)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: "Portföy alınamadı." }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, userId } = await getAppUserId();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = (await request.json()) as {
    portfolioId?: string;
    symbol?: string;
    assetType?: string;
    buyPrice?: number;
    quantity?: number;
    type?: "BUY" | "SELL";
  };

  const symbol = body.symbol?.trim().toUpperCase();
  const buyPrice = Number(body.buyPrice);
  const quantity = Number(body.quantity);
  const type = body.type === "SELL" ? "SELL" : "BUY";
  if (!symbol || !Number.isFinite(buyPrice) || buyPrice < 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Geçerli sembol, fiyat ve miktar girin." }, { status: 400 });
  }

  let portfolioId = body.portfolioId;
  if (!portfolioId) {
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (portfolioError || !portfolio) return NextResponse.json({ error: "Portföy oluşturulamadı." }, { status: 500 });
    portfolioId = portfolio.id;
  }

  const { data: ownedPortfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("user_id", userId)
    .single();
  if (!ownedPortfolio) return NextResponse.json({ error: "Portföy bulunamadı." }, { status: 404 });

  const { error } = await supabase.from("portfolio_transactions").insert({
    portfolio_id: portfolioId,
    symbol,
    asset_type: body.assetType?.trim().toUpperCase() || "STOCK",
    buy_price: buyPrice,
    quantity,
    type,
  });
  if (error) return NextResponse.json({ error: "İşlem kaydedilemedi." }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { supabase, userId } = await getAppUserId();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const symbol = new URL(request.url).searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol) return NextResponse.json({ error: "Silinecek varlık belirtilmedi." }, { status: 400 });

  const { data: owned } = await supabase.from("portfolios").select("id").eq("user_id", userId);
  const ids = (owned ?? []).map((portfolio) => portfolio.id as string);
  if (!ids.length) return NextResponse.json({ ok: true });

  const { error } = await supabase.from("portfolio_transactions").delete().in("portfolio_id", ids).eq("symbol", symbol);
  if (error) return NextResponse.json({ error: "Varlık silinemedi." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
