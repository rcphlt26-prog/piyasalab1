import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const METRICS = new Set(["PRICE", "DAILY_CHANGE", "PE_RATIO", "MA200"]);
const CONDITIONS = new Set(["ABOVE", "BELOW"]);

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
  const { data, error } = await supabase.from("price_alerts").select("id, symbol, target_value, condition, metric_type, is_triggered, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Alarmlar alınamadı." }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, userId } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  const body = (await request.json()) as { symbol?: string; targetValue?: number; condition?: string; metricType?: string };
  const symbol = body.symbol?.trim().toUpperCase();
  const targetValue = Number(body.targetValue);
  const condition = body.condition?.toUpperCase() ?? "ABOVE";
  const metricType = body.metricType?.toUpperCase() ?? "PRICE";
  if (!symbol || !Number.isFinite(targetValue) || !CONDITIONS.has(condition) || !METRICS.has(metricType)) {
    return NextResponse.json({ error: "Sembol, hedef, koşul ve metrik bilgilerini kontrol edin." }, { status: 400 });
  }
  const { data, error } = await supabase.from("price_alerts").insert({ user_id: userId, symbol, target_value: targetValue, condition, metric_type: metricType }).select("id, symbol, target_value, condition, metric_type, is_triggered, created_at").single();
  if (error) return NextResponse.json({ error: "Alarm oluşturulamadı." }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { supabase, userId } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Alarm id gerekli." }, { status: 400 });
  const { error } = await supabase.from("price_alerts").delete().eq("id", id).eq("user_id", userId);
  if (error) return NextResponse.json({ error: "Alarm silinemedi." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
