import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { containsProfanity, isValidUsername } from "@/lib/contentModeration";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase yapılandırılmamış." }, { status: 503 });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = (await request.json()) as { username?: string; accepted?: boolean };
  const username = body.username?.trim().toLowerCase() ?? "";
  if (!isValidUsername(username) || containsProfanity(username)) {
    return NextResponse.json({ error: "Takma ad 3-30 karakter olmalı; yalnızca harf, rakam ve alt çizgi kullanmalı ve argo içermemelidir." }, { status: 400 });
  }
  if (!body.accepted) return NextResponse.json({ error: "Topluluk kurallarını kabul etmelisiniz." }, { status: 400 });

  const database = getSupabaseAdminClient() ?? supabase;
  const { data: conflict, error: conflictError } = await database.from("app_users").select("id").ilike("username", username).neq("supabase_user_id", authData.user.id).maybeSingle();
  if (conflictError) return NextResponse.json({ error: "Takma ad kontrolü yapılamadı." }, { status: 500 });
  if (conflict) return NextResponse.json({ error: "Bu takma ad zaten kullanılıyor." }, { status: 409 });

  const profile = {
    supabase_user_id: authData.user.id,
    email: authData.user.email ?? `${authData.user.id}@unknown.local`,
    username,
    is_kvkk_accepted: true,
    kvkk_accepted_at: new Date().toISOString(),
  };
  const { data: updatedProfile, error: updateError } = await database
    .from("app_users")
    .update({ username, is_kvkk_accepted: true, kvkk_accepted_at: profile.kvkk_accepted_at })
    .eq("supabase_user_id", authData.user.id)
    .select("id")
    .maybeSingle();
  if (updateError && (updateError.code === "42703" || updateError.message.includes("is_kvkk_accepted") || updateError.message.includes("kvkk_accepted_at"))) {
    const { data: legacyProfile, error: legacyError } = await database
      .from("app_users")
      .update({ username })
      .eq("supabase_user_id", authData.user.id)
      .select("id")
      .maybeSingle();
    if (!legacyError && legacyProfile) return NextResponse.json({ ok: true, username, warning: "KVKK kolonları henüz migration ile eklenmemiş." });
    if (legacyError) return NextResponse.json({ error: `Takma ad kaydedilemedi: ${legacyError.message}` }, { status: 500 });
  }

  if (updateError) {
    if (updateError.code === "23505") return NextResponse.json({ error: "Bu takma ad zaten kullanılıyor." }, { status: 409 });
    return NextResponse.json({ error: `Takma ad kaydedilemedi: ${updateError.message}` }, { status: 500 });
  }

  if (!updatedProfile) {
    const { error: insertError } = await database.from("app_users").insert(profile);
    if (insertError) {
      if (insertError.code === "23505") return NextResponse.json({ error: "Bu takma ad zaten kullanılıyor." }, { status: 409 });
      return NextResponse.json({ error: `Profil oluşturulamadı: ${insertError.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
