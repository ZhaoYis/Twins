import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Sparkles, Github, Twitter, BookOpen, Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations("common");

  const links = {
    product: [
      { label: t("dashboard"), href: "/dashboard" },
      { label: t("howItWorks"), href: "#how-it-works" },
      { label: "定价", href: "#pricing" },
    ],
    resources: [
      { label: "文档", href: "#" },
      { label: "API", href: "#" },
      { label: "更新日志", href: "#" },
    ],
    legal: [
      { label: "隐私政策", href: "#" },
      { label: "服务条款", href: "#" },
    ],
  };

  return (
    <footer className="relative border-t border-border/50">
      {/* Background - minimal */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold gradient-text">{t("siteName")}</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/ZhaoYis/Twins"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <BookOpen className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">产品</h4>
            <ul className="space-y-2">
              {links.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">资源</h4>
            <ul className="space-y-2">
              {links.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">法律</h4>
            <ul className="space-y-2">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {t("siteName")}. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> using AI
          </div>
        </div>
      </div>
    </footer>
  );
}
