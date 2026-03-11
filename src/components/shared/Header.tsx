"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { logout } from "@/lib/auth/actions";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text">
          {t("siteName")}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            {t("howItWorks")}
          </Link>
          <a
            href="https://github.com/ZhaoYis/Twins"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("github")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Globe className="w-5 h-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {session ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">{t("dashboard")}</Link>
              </Button>
              <form action={logout}>
                <Button variant="outline" type="submit">
                  {t("signOut")}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">{t("signIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">{t("getStarted")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
