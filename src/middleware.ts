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

  // Skip for API routes, static files, etc.
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

  // Check authentication for protected routes
  const isLoggedIn = !!req.auth;
  const protectedRoutes = ['dashboard', 'settings'];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(`/${route}`)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
