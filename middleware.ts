import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In local environments without live Supabase configured, pass through gracefully
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/account") ||
    request.nextUrl.pathname.startsWith("/chauffeur") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Strict Role Guard: Only administrators can access /admin routes
  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const userRole = user.user_metadata?.role || "customer";
    if (userRole !== "admin") {
      // Forbidden: Regular customer attempting to access admin console is redirected to customer dashboard
      const customerUrl = request.nextUrl.clone();
      customerUrl.pathname = "/account/dashboard";
      customerUrl.search = "";
      return NextResponse.redirect(customerUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/chauffeur/:path*", "/admin/:path*"],
};
