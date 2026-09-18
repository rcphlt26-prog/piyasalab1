import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase service role yapılandırılmamış." }, { status: 503 });

  const { data, error } = await admin.rpc("cleanup_blocked_forum_content");
  if (error) return NextResponse.json({ error: "Forum temizliği başarısız.", detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, removed: Number(data ?? 0) });
}
