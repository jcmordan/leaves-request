import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define route types
  const isAuthPage = nextUrl.pathname.match(/\/(es|en)\/auth\/login/);
  const isStaticFile = nextUrl.pathname.match(/\.(.*)$/);
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // If unauthenticated and on a protected route, redirect to login page with locale
  if (!isLoggedIn && !isAuthPage && !isStaticFile && !isApiRoute) {
    const segments = nextUrl.pathname.split("/");
    const locale = routing.locales.includes(segments[1])
      ? segments[1]
      : routing.defaultLocale;

    const signInUrl = new URL(`/${locale}/auth/login`, nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.href);

    return NextResponse.redirect(signInUrl);
  }

  return handleI18nRouting(req);
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (internal files)
  // - _static (if used)
  // - static files (e.g. favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
