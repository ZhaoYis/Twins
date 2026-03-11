import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">{t("siteName")}</span>
            <span className="text-muted-foreground text-sm">{t("tagline")}</span>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              {t("dashboard")}
            </Link>
            <a
              href="https://github.com/ZhaoYis/Twins"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("github")}
            </a>
          </nav>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("siteName")}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
