import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function getContext() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, userId: null };
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { supabase, userId: null };
  const { data: appUser } = await supabase.from("app_users").select("id").eq("supabase_user_id", authData.user.id).single();
  return { supabase, userId: appUser?.id ?? null };
}

export async function GET() {
  const { supabase, userId } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const { data, error } = await supabase.from("watchlists").select("id, symbols").eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: "İzleme listesi alınamadı." }, { status: 500 });
  return NextResponse.json({ id: data?.id ?? null, symbols: data?.symbols ?? [] });
}

export async function PUT(request: Request) {
  const { supabase, userId } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = (await request.json()) as { symbols?: unknown };
  const symbols = Array.isArray(body.symbols)
    ? Array.from(new Set(body.symbols.filter((symbol): symbol is string => typeof symbol === "string").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))).slice(0, 100)
    : null;
  if (!symbols) return NextResponse.json({ error: "Geçerli sembol listesi gönderin." }, { status: 400 });

  const { data: existing } = await supabase.from("watchlists").select("id").eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  const query = existing
    ? supabase.from("watchlists").update({ symbols }).eq("id", existing.id).eq("user_id", userId)
    : supabase.from("watchlists").insert({ user_id: userId, symbols });
  const { error } = await query;
  if (error) return NextResponse.json({ error: "İzleme listesi kaydedilemedi." }, { status: 500 });
  return NextResponse.json({ symbols });
}
