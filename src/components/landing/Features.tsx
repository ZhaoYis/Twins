"use client";

import { useTranslations } from "next-intl";
import { Upload, Brain, PenTool, Sparkles, Zap, Shield, Globe, Cpu, Layers } from "lucide-react";

export function Features() {
  const t = useTranslations("landing.features");

  const mainFeatures = [
    {
      icon: Upload,
      title: t("step1.title"),
      description: t("step1.description"),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      icon: Brain,
      title: t("step2.title"),
      description: t("step2.description"),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      icon: PenTool,
      title: t("step3.title"),
      description: t("step3.description"),
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-500/20",
    },
  ];

  const techFeatures = [
    { icon: Sparkles, title: "AI 驱动", description: "先进的大语言模型技术" },
    { icon: Zap, title: "实时生成", description: "毫秒级响应速度" },
    { icon: Shield, title: "数据安全", description: "端到端加密保护" },
    { icon: Globe, title: "多语言", description: "支持 50+ 种语言" },
    { icon: Cpu, title: "自定义模型", description: "支持 BYOK 部署" },
    { icon: Layers, title: "风格克隆", description: "精准复刻写作风格" },
  ];

  return (
    <section id="features" className="py-32 bg-muted/30 dark:bg-muted/10">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Main features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech features */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">技术特性</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl bg-card/50 dark:bg-card/30 border border-border/50 dark:border-white/5 hover:border-border dark:hover:border-white/10 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium mb-1">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
