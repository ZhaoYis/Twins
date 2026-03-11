"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Headphones, Sparkles, Infinity, Clock, Users } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Pricing() {
  const t = useTranslations("landing.pricing");

  const features = [
    { icon: Infinity, text: t("features.unlimitedProfiles") },
    { icon: Sparkles, text: t("features.unlimitedArticles") },
    { icon: Zap, text: t("features.unlimitedGeneration") },
    { icon: Headphones, text: t("features.aiSupport") },
    { icon: Users, text: t("features.styleDNA") },
    { icon: Clock, text: t("features.streaming") },
    { icon: Shield, text: t("features.prioritySupport") },
  ];

  const highlights = [
    { icon: Zap, value: "∞", label: "无限生成" },
    { icon: Users, value: "99%", label: "满意度" },
    { icon: Clock, value: "<1s", label: "响应时间" },
  ];

  return (
    <section id="pricing" className="py-24 section-muted relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-card/50 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">免费使用</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {highlights.map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-muted-foreground">
              <div className="icon-container-neon">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing card */}
        <div className="max-w-lg mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-cyan-500 to-purple-500 rounded-3xl blur-lg opacity-20" />

            <Card className="relative border-2 border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden">
              {/* Top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-500 to-purple-500" />

              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  完全免费
                </div>
              </div>

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
                <CardDescription className="text-muted-foreground">{t("subtitle")}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold gradient-text">¥0</span>
                  <span className="text-muted-foreground ml-2">/ 永久免费</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 group">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground/90">{feature.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-6">
                <Button className="w-full font-medium btn-primary-tech h-12" size="lg" asChild>
                  <Link href="/dashboard">
                    <Sparkles className="mr-2 w-4 h-4" />
                    {t("badge")}
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  无需信用卡 · 即刻开始使用
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Bottom notes */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <div className="tech-card p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium mb-1">{t("note")}</p>
                <p className="text-sm text-muted-foreground">{t("note2")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
