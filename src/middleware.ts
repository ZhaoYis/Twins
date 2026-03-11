import createMiddleware from 'next-intl/middleware';
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Check admin API routes first (no locale prefix)
  if (pathname.startsWith('/api/admin')) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (req.auth.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Skip for other API routes, static files, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if path starts with a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect to default locale if missing
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, nextUrl)
    );
  }

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  // Check admin page routes
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!req.auth) {
      const loginUrl = new URL(`/${locale}/auth/signin`, nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (req.auth.user.role !== "admin") {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }
  }

  // Check authentication for protected routes
  const isLoggedIn = !!req.auth;
  const protectedRoutes = ['dashboard', 'settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(`/${route}`)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)", "/api/admin/:path*"],
};
