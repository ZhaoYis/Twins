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
      {/* Aurora gradient background */}
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 mesh-gradient opacity-60" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-40" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-primary mb-10">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t("badge")}</span>
          </div>

          {/* Main headline with typewriter effect */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            <span className="block text-foreground">
              <TypewriterText text={t("title1")} speed={80} delay={300} />
            </span>
            <span className="block gradient-text mt-2">
              <TypewriterText text={t("title2")} speed={60} delay={1200} />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            {t("subtitle")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold rounded-xl btn-cta"
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
              className="h-14 px-8 text-base font-medium rounded-xl btn-secondary"
              asChild
            >
              <Link href="#features">{t("seeHowItWorks")}</Link>
            </Button>
          </div>

          {/* Stats - Bento style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bento-card text-center p-6"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-20 pt-8 border-t border-border max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Shield className="w-4 h-4" />
            <span className="text-sm">{t("trustBadges.encrypted")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Zap className="w-4 h-4" />
            <span className="text-sm">{t("trustBadges.free")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
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
