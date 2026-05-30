import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { serverEnv } from "@/lib/env";

const PUBLIC_APP_PATHS = new Set(["/app/login", "/app/register", "/app/forgot-password"]);
const PUBLIC_NEGOCIO_PATHS = new Set([
  "/negocio",
  "/negocio/login",
  "/negocio/register",
  "/negocio/forgot-password",
]);

// Refreshes the Supabase session cookie on every request and gates the two
// portals. Role enforcement (client vs business) lives in the route-group
// layouts — middleware only checks authentication presence.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = serverEnv();

  const supabase = createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAppProtected = pathname.startsWith("/app") && !PUBLIC_APP_PATHS.has(pathname);
  const isNegocioProtected =
    pathname.startsWith("/negocio") && !PUBLIC_NEGOCIO_PATHS.has(pathname);

  if (!user && isAppProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  if (!user && isNegocioProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/negocio/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
