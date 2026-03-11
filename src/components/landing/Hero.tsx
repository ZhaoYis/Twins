"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Cpu, Users, FileText, Globe } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Hero() {
  const t = useTranslations("landing.hero");

  const stats = [
    { icon: Users, value: "10K+", label: "活跃用户" },
    { icon: FileText, value: "1M+", label: "生成内容" },
    { icon: Globe, value: "50+", label: "支持语言" },
    { icon: Zap, value: "99.9%", label: "服务可用" },
  ];

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Animated blobs */}
      <div className="tech-blob tech-blob-1 w-[600px] h-[600px] -top-20 -left-20" />
      <div className="tech-blob tech-blob-2 w-[500px] h-[500px] top-1/2 right-0" />
      <div className="tech-blob tech-blob-3 w-[400px] h-[400px] bottom-0 left-1/3" />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-2/3 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/80 backdrop-blur-sm mb-8 animated-gradient-border">
          <div className="relative">
            <Sparkles className="w-4 h-4 text-primary" />
            <div className="pulse-dot absolute inset-0 rounded-full bg-primary/30" />
          </div>
          <span className="text-sm font-medium">{t("badge")}</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-6 leading-tight">
          <span className="gradient-text neon-text-glow">{t("title1")}</span>
          <br />
          <span className="text-foreground">{t("title2")}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          {t("subtitle")}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="btn-primary-tech font-medium px-8 h-12" asChild>
            <Link href="/dashboard">
              {t("cta")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="font-medium h-12 border-primary/30 hover:border-primary/50" asChild>
            <Link href="#how-it-works">{t("seeHowItWorks")}</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card group cursor-default">
              <stat.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="icon-container-neon">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{t("trustBadges.encrypted")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="icon-container-neon">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{t("trustBadges.free")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="icon-container-neon">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{t("trustBadges.byok")}</span>
          </div>
        </div>

        {/* Floating tech elements */}
        <div className="absolute top-1/4 left-10 hidden lg:block float-animation" style={{ animationDelay: '0s' }}>
          <div className="tech-card p-3 backdrop-blur-md bg-card/50">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-1/3 right-10 hidden lg:block float-animation" style={{ animationDelay: '2s' }}>
          <div className="tech-card p-3 backdrop-blur-md bg-card/50">
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-16 hidden lg:block float-animation" style={{ animationDelay: '4s' }}>
          <div className="tech-card p-3 backdrop-blur-md bg-card/50">
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
