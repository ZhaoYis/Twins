"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Cpu, Users, FileText, Globe } from "lucide-react";
import { Link } from "@/i18n/routing";
import { TypewriterText } from "@/hooks/use-typewriter";

export function Hero() {
  const t = useTranslations("landing.hero");

  const stats = [
    { icon: Users, value: "10K+", label: "活跃用户" },
    { icon: FileText, value: "1M+", label: "生成内容" },
    { icon: Globe, value: "50+", label: "支持语言" },
    { icon: Zap, value: "99.9%", label: "服务可用" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

      {/* Very subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-10 dark:border-primary/40 dark:bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("badge")}</span>
          </div>

          {/* Main headline with typewriter effect */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            <span className="block text-foreground">
              <TypewriterText text={t("title1")} speed={80} delay={300} />
            </span>
            <span className="block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent mt-2">
              <TypewriterText text={t("title2")} speed={60} delay={1200} />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {t("subtitle")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              asChild
            >
              <Link href="/dashboard">
                {t("cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-medium rounded-full border-border dark:border-white/20 hover:border-foreground/30 dark:hover:border-white/30 hover:bg-foreground/5"
              asChild
            >
              <Link href="#features">{t("seeHowItWorks")}</Link>
            </Button>
          </div>

          {/* Stats - cleaner design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-muted/30 dark:bg-muted/20 border border-transparent dark:border-white/5">
                <stat.icon className="w-5 h-5 text-muted-foreground mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges - minimal */}
        <div className="flex flex-wrap justify-center gap-8 mt-20 pt-8 border-t border-border dark:border-white/10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="w-4 h-4" />
            <span className="text-sm">{t("trustBadges.encrypted")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Zap className="w-4 h-4" />
            <span className="text-sm">{t("trustBadges.free")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Cpu className="w-4 h-4" />
            <span className="text-sm">{t("trustBadges.byok")}</span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
