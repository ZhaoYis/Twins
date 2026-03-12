"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Upload, Brain, PenTool, Sparkles, Zap, Shield, Globe, Cpu, Layers, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Features() {
  const t = useTranslations("landing.features");

  const mainFeatures = [
    {
      icon: Upload,
      title: t("step1.title"),
      description: t("step1.description"),
      color: "text-indigo-500",
      gradient: "from-indigo-500 to-purple-500",
      size: "md",
    },
    {
      icon: Brain,
      title: t("step2.title"),
      description: t("step2.description"),
      color: "text-purple-500",
      gradient: "from-purple-500 to-pink-500",
      size: "lg",
    },
    {
      icon: PenTool,
      title: t("step3.title"),
      description: t("step3.description"),
      color: "text-emerald-500",
      gradient: "from-emerald-500 to-teal-500",
      size: "md",
    },
  ];

  const techFeatures = [
    { icon: Sparkles, title: t("techFeatures.aiDriven.title"), description: t("techFeatures.aiDriven.description"), color: "text-indigo-500" },
    { icon: Zap, title: t("techFeatures.realtime.title"), description: t("techFeatures.realtime.description"), color: "text-amber-500" },
    { icon: Shield, title: t("techFeatures.security.title"), description: t("techFeatures.security.description"), color: "text-emerald-500" },
    { icon: Globe, title: t("techFeatures.multilingual.title"), description: t("techFeatures.multilingual.description"), color: "text-blue-500" },
    { icon: Cpu, title: t("techFeatures.customModel.title"), description: t("techFeatures.customModel.description"), color: "text-purple-500" },
    { icon: Layers, title: t("techFeatures.styleClone.title"), description: t("techFeatures.styleClone.description"), color: "text-pink-500" },
  ];

  return (
    <section id="features" className="py-32 section-muted relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t("title")}{" "}
            <span className="gradient-text">{t("titleHighlight")}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Bento Grid - Main Features */}
        <div className="bento-grid max-w-5xl mx-auto mb-20">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`bento-card bento-card-${feature.size} group cursor-pointer`}
            >
              {/* Gradient accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className={`w-5 h-5 ${feature.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tech Features Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("techSection")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techFeatures.map((feature, index) => (
              <div
                key={index}
                className="feature-card group cursor-pointer"
              >
                <feature.icon className={`w-5 h-5 ${feature.color} mb-4`} />
                <div className="font-semibold mb-1">{feature.title}</div>
                <div className="text-sm text-muted-foreground">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button size="lg" className="btn-cta" asChild>
            <Link href="/dashboard">
              {t("startNow")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
