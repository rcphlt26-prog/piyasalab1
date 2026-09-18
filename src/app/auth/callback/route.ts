import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// Supabase Dashboard > Authentication > URL Configuration:
// Site URL: https://piyasalab.com.tr (local: http://localhost:3000)
// Redirect URLs: https://piyasalab.com.tr/auth/callback
//                 http://localhost:3000/auth/callback
// Authentication > Email Templates > Confirm signup: use {{ .RedirectTo }} in the link.

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get("error") || requestUrl.searchParams.get("error_code")) {
    return NextResponse.redirect(new URL("/login?error=email-link-expired", requestUrl.origin));
  }
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? requestUrl.searchParams.get("redirect");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  const loginUrl = new URL("/login?error=auth-code-error", requestUrl.origin);

  if (!code) return NextResponse.redirect(loginUrl);

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(loginUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(loginUrl);

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.redirect(loginUrl);

  const database = getSupabaseAdminClient() ?? supabase;
  const { data: appUser } = await database
    .from("app_users")
    .select("id, username")
    .eq("supabase_user_id", authData.user.id)
    .maybeSingle();

  if (!appUser) {
    await database.from("app_users").insert({
      supabase_user_id: authData.user.id,
      email: authData.user.email ?? `${authData.user.id}@unknown.local`,
      username: `user_${authData.user.id.replace(/-/g, "").slice(0, 8)}`,
    });
  }
  const incompleteUsername = !appUser?.username || /^user_[a-f0-9]{8}$/i.test(appUser.username);
  if (incompleteUsername) return NextResponse.redirect(new URL(`/onboarding?next=${encodeURIComponent(nextPath)}`, requestUrl.origin));

  const redirectUrl = new URL(nextPath, requestUrl.origin);
  redirectUrl.searchParams.set("auth", "verified");
  return NextResponse.redirect(redirectUrl);
}
