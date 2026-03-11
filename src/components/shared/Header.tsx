"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { logout } from "@/lib/auth/actions";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Globe, Sparkles, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  session?: Session | null;
}

const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
] as const;

export function Header({ session }: HeaderProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl relative">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary to-purple-500 opacity-0 group-hover:opacity-30 blur transition-opacity" />
          </div>
          <span className="text-xl font-semibold gradient-text">{t("siteName")}</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
          >
            {t("howItWorks")}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all" />
          </Link>
          <a
            href="https://github.com/ZhaoYis/Twins"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
          >
            {t("github")}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all" />
          </a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="relative group">
                  <Globe className="w-5 h-5" />
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="border-primary/20">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="focus:bg-primary/10 focus:text-primary"
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Button variant="ghost" asChild className="hover:bg-primary/5">
                  <Link href="/dashboard">{t("dashboard")}</Link>
                </Button>
                <form action={logout}>
                  <Button variant="outline" type="submit" className="border-primary/30 hover:border-primary/50">
                    {t("signOut")}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:bg-primary/5">
                  <Link href="/auth/signin">{t("signIn")}</Link>
                </Button>
                <Button asChild className="btn-primary-tech">
                  <Link href="/dashboard">{t("getStarted")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="space-y-2">
              <Link
                href="#how-it-works"
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("howItWorks")}
              </Link>
              <a
                href="https://github.com/ZhaoYis/Twins"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("github")}
              </a>
            </nav>
            <div className="pt-4 border-t border-border/50 space-y-2">
              {session ? (
                <>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard">{t("dashboard")}</Link>
                  </Button>
                  <form action={logout}>
                    <Button variant="outline" type="submit" className="w-full">
                      {t("signOut")}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/auth/signin">{t("signIn")}</Link>
                  </Button>
                  <Button className="w-full btn-primary-tech" asChild>
                    <Link href="/dashboard">{t("getStarted")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
