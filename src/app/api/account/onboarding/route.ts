import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

  const { data: conflict } = await supabase.from("app_users").select("id").ilike("username", username).neq("supabase_user_id", authData.user.id).maybeSingle();
  if (conflict) return NextResponse.json({ error: "Bu takma ad zaten kullanılıyor." }, { status: 409 });

  const { error } = await supabase
    .from("app_users")
    .update({ username, is_kvkk_accepted: true, kvkk_accepted_at: new Date().toISOString() })
    .eq("supabase_user_id", authData.user.id);
  if (error) return NextResponse.json({ error: "Takma ad kaydedilemedi." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
