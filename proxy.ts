import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import {
  detectLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
} from "@/lib/i18n/config";

// Pages that need a signed-in owner.
const protectedPrefixes = ["/dashboard", "/onboarding"];

function isProtected(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// Runs before every page request. It does two jobs:
// 1. Optimistic sign-in check: only looks for the session cookie, without asking the
//    database. The real check happens on the server in lib/dal.ts, close to the data.
// 2. Language: the pages live under app/[locale]/, but the address never shows it. The
//    proxy reads the "locale" cookie (or the browser language) and rewrites /dashboard
//    to /uk/dashboard behind the scenes.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Someone typed /uk/... by hand: remember the language and use the normal address.
  const firstSegment = pathname.split("/")[1];
  if (isLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(firstSegment.length + 1) || "/";
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  if (isProtected(pathname) && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved)
    ? saved
    : detectLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except the API, Next.js files and files with an extension (icons, images).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
