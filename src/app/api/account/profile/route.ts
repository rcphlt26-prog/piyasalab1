import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidUsername, containsProfanity } from "@/lib/contentModeration";

type ProfileRow = { username?: string | null; role?: string | null; username_last_changed_at?: string | null; is_kvkk_accepted?: boolean | null; kvkk_accepted_at?: string | null };

async function getContext() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, admin: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, admin: getSupabaseAdminClient(), user: data.user };
}

export async function GET() {
  const { supabase, user } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const full = await supabase.from("app_users").select("username, role, username_last_changed_at, is_kvkk_accepted, kvkk_accepted_at").eq("supabase_user_id", user.id).maybeSingle();
  const data = (full.error ? (await supabase.from("app_users").select("username, role").eq("supabase_user_id", user.id).maybeSingle()).data : full.data) as ProfileRow | null;
  if (!data && full.error) return NextResponse.json({ error: "Profil alınamadı." }, { status: 500 });
  return NextResponse.json({
    data: {
      username: data?.username ?? null,
      role: data?.role ?? "USER",
      usernameLastChangedAt: data?.username_last_changed_at ?? null,
      isKvkkAccepted: Boolean(data?.is_kvkk_accepted),
      kvkkAcceptedAt: data?.kvkk_accepted_at ?? null,
      email: user.email ?? null,
      emailConfirmedAt: user.email_confirmed_at ?? null,
    },
  });
}

export async function PATCH(request: Request) {
  const { supabase, admin, user } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = (await request.json()) as { username?: string };
  const username = body.username?.trim().toLowerCase() ?? "";
  if (!isValidUsername(username) || containsProfanity(username)) return NextResponse.json({ error: "Takma ad 3-30 karakter olmalı ve yalnızca güvenli karakterler içermelidir." }, { status: 400 });

  const database = admin ?? supabase;
  const fullProfile = await database.from("app_users").select("username, username_last_changed_at").eq("supabase_user_id", user.id).maybeSingle();
  const profile = (fullProfile.error ? (await database.from("app_users").select("username").eq("supabase_user_id", user.id).maybeSingle()).data : fullProfile.data) as ProfileRow | null;
  const lastChanged = profile?.username_last_changed_at ? new Date(profile.username_last_changed_at).getTime() : 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  if (lastChanged && Date.now() - lastChanged < weekMs) {
    const remainingDays = Math.ceil((weekMs - (Date.now() - lastChanged)) / (24 * 60 * 60 * 1000));
    return NextResponse.json({ error: `Takma adınızı tekrar değiştirmek için ${remainingDays} gün beklemelisiniz.` }, { status: 429 });
  }

  const { data: conflict } = await database.from("app_users").select("id").ilike("username", username).neq("supabase_user_id", user.id).maybeSingle();
  if (conflict) return NextResponse.json({ error: "Bu takma ad zaten kullanılıyor." }, { status: 409 });

  const updateWithTimestamp = await database.from("app_users").update({ username, username_last_changed_at: new Date().toISOString() }).eq("supabase_user_id", user.id);
  const error = updateWithTimestamp.error?.code === "42703" ? (await database.from("app_users").update({ username }).eq("supabase_user_id", user.id)).error : updateWithTimestamp.error;
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Bu takma ad zaten kullanılıyor." : "Profil güncellenemedi." }, { status: error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ ok: true, username });
}
