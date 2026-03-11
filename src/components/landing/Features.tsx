"use client";

import { useTranslations } from "next-intl";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, PenTool } from "lucide-react";

const icons = {
  Upload,
  Brain,
  PenTool,
};

export function Features() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: Upload,
      title: t("step1.title"),
      description: t("step1.description"),
    },
    {
      icon: Brain,
      title: t("step2.title"),
      description: t("step2.description"),
    },
    {
      icon: PenTool,
      title: t("step3.title"),
      description: t("step3.description"),
    },
  ];

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("title")} <span className="gradient-text">{t("titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="gradient-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
