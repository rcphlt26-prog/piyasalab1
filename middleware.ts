import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/portfoy", "/ayarlar"];
const authRoutes = ["/login", "/register"];
const publicPrefixes = ["/onboarding", "/auth", "/api", "/gizlilik", "/cerezler", "/kullanim-sartlari", "/yasal-uyari", "/iletisim"];

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
  return target;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        const rememberMe = request.cookies.get("veriakis-remember-me")?.value === "1";
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          path: "/",
          ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
        };
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options, ...cookieOptions });
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, { ...options, ...cookieOptions });
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublic = publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirect=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`;
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  if (user && !isPublic && pathname !== "/onboarding") {
    const { data: appUser } = await supabase.from("app_users").select("username").eq("supabase_user_id", user.id).maybeSingle();
    if (!appUser?.username || /^user_[a-f0-9]{8}$/i.test(appUser.username)) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding";
      onboardingUrl.search = `?next=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`;
      return copyCookies(response, NextResponse.redirect(onboardingUrl));
    }
  }

  if (user && pathname === "/onboarding") {
    const { data: appUser } = await supabase.from("app_users").select("username").eq("supabase_user_id", user.id).maybeSingle();
    if (appUser?.username && !/^user_[a-f0-9]{8}$/i.test(appUser.username)) {
      const portfolioUrl = request.nextUrl.clone();
      portfolioUrl.pathname = "/portfoy";
      portfolioUrl.search = "";
      return copyCookies(response, NextResponse.redirect(portfolioUrl));
    }
  }

  if (user && isAuthRoute) {
    const portfolioUrl = request.nextUrl.clone();
    portfolioUrl.pathname = "/portfoy";
    portfolioUrl.search = "";
    return copyCookies(response, NextResponse.redirect(portfolioUrl));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
