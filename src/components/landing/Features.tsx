"use client";

import { useTranslations } from "next-intl";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, PenTool, Sparkles, Zap, Shield, Globe, Cpu, Layers, Wand2 } from "lucide-react";

export function Features() {
  const t = useTranslations("landing.features");

  const mainFeatures = [
    {
      icon: Upload,
      title: t("step1.title"),
      description: t("step1.description"),
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: Brain,
      title: t("step2.title"),
      description: t("step2.description"),
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: PenTool,
      title: t("step3.title"),
      description: t("step3.description"),
      color: "text-cyan-500",
      gradient: "from-cyan-500/20 to-cyan-600/10",
    },
  ];

  const techFeatures = [
    { icon: Sparkles, title: "AI 驱动", description: "先进的大语言模型技术" },
    { icon: Zap, title: "实时生成", description: "毫秒级响应速度" },
    { icon: Shield, title: "数据安全", description: "端到端加密保护" },
    { icon: Globe, title: "多语言", description: "支持50+种语言" },
    { icon: Cpu, title: "自定义模型", description: "支持BYOK部署" },
    { icon: Layers, title: "风格克隆", description: "精准复刻写作风格" },
  ];

  return (
    <section className="py-24 section-muted relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-card/50 backdrop-blur-sm mb-6">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">核心功能</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("title")} <span className="gradient-text">{t("titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Main features - Bento Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`bento-item p-8 bg-gradient-to-br ${feature.gradient}`}
            >
              <div className={`icon-container-neon mb-6 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                <div className="absolute top-4 right-4 w-px h-8 bg-gradient-to-b from-primary/40 to-transparent" />
                <div className="absolute top-4 right-4 w-8 h-px bg-gradient-to-l from-primary/40 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Tech specs grid */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-muted-foreground">技术特性</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techFeatures.map((feature, index) => (
              <div
                key={index}
                className="tech-card p-4 text-center group cursor-default"
              >
                <feature.icon className="w-6 h-6 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium mb-1">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Code preview terminal */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="terminal-style p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">twins-cli</span>
            </div>
            <div className="font-mono text-sm space-y-2">
              <div className="flex gap-2">
                <span className="text-green-500">$</span>
                <span className="text-foreground/80">twins clone --style ./my-articles</span>
              </div>
              <div className="text-muted-foreground pl-4">
                <span className="text-cyan-500">→</span> 正在分析 1,234 篇文章...
              </div>
              <div className="text-muted-foreground pl-4">
                <span className="text-cyan-500">→</span> 提取写作风格特征...
              </div>
              <div className="text-muted-foreground pl-4">
                <span className="text-cyan-500">→</span> 训练个性化模型...
              </div>
              <div className="text-green-400 pl-4">
                ✓ 风格克隆完成！现在可以生成内容了。
              </div>
              <div className="flex gap-2 mt-4">
                <span className="text-green-500">$</span>
                <span className="text-foreground/80">twins generate "写一篇关于AI的文章"</span>
                <span className="animate-pulse text-primary">▌</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
