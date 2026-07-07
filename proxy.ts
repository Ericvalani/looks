import { NextResponse, type NextRequest } from "next/server";
import { createProxyClient } from "@/lib/supabase/proxy";
import { GATE_COOKIE, isGateCookieValid } from "@/lib/auth/gate";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth endpoints handle their own checks and must stay reachable pre-gate/pre-login.
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const { supabase, response } = createProxyClient(request);

  const hasGate = isGateCookieValid(request.cookies.get(GATE_COOKIE)?.value);
  const isGatePage = pathname === "/login";
  const isProfilePage = pathname === "/login/profile";

  if (!hasGate) {
    if (isGatePage) return response;
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProfilePage) return response;
    return NextResponse.redirect(new URL("/login/profile", request.url));
  }

  if (isGatePage || isProfilePage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
