"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { logout } from "@/lib/auth/actions";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Globe, Sparkles, Menu, X, Wand2, Zap, Coins, BookOpen, Rocket } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

interface HeaderProps {
  session?: Session | null;
}

const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
] as const;

const navItems = [
  { href: "#features", labelKey: "features", icon: Wand2 },
  { href: "#how-it-works", labelKey: "howItWorks", icon: BookOpen },
  { href: "#pricing", labelKey: "pricing", icon: Coins },
];

export function Header({ session }: HeaderProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl relative transition-all duration-300 ${scrolled ? 'shadow-lg shadow-primary/5' : ''}`}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary to-purple-500 opacity-0 group-hover:opacity-30 blur transition-opacity" />
          </div>
          <span className="text-xl font-semibold gradient-text">{t("siteName")}</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 text-sm font-medium relative group px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
              {t(item.labelKey)}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-cyan-500 group-hover:w-4/5 transition-all duration-300" />
            </a>
          ))}
          <a
            href="https://github.com/ZhaoYis/Twins"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 text-sm font-medium relative group px-3 py-2 rounded-lg hover:bg-primary/5"
          >
            <svg className="w-4 h-4 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {t("github")}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-cyan-500 group-hover:w-4/5 transition-all duration-300" />
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
                <Button variant="ghost" size="icon" className="relative group hover:bg-primary/5">
                  <Globe className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-4 transition-all duration-300" />
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
                  <Button variant="outline" type="submit" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                    {t("signOut")}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:bg-primary/5">
                  <Link href="/auth/signin">{t("signIn")}</Link>
                </Button>
                <Button asChild className="btn-primary-tech relative overflow-hidden group">
                  <Link href="/dashboard">
                    <span className="relative z-10 flex items-center">
                      <Rocket className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                      {t("getStarted")}
                    </span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 py-2.5 px-3 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </a>
              ))}
              <a
                href="https://github.com/ZhaoYis/Twins"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2.5 px-3 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-primary/5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
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
                    <Link href="/dashboard">
                      <Rocket className="w-4 h-4 mr-2" />
                      {t("getStarted")}
                    </Link>
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
