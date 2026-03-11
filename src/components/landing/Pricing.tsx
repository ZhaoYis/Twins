"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Pricing() {
  const t = useTranslations("landing.pricing");

  const features = [
    t("features.unlimitedProfiles"),
    t("features.unlimitedArticles"),
    t("features.unlimitedGeneration"),
    t("features.aiSupport"),
    t("features.styleDNA"),
    t("features.streaming"),
    t("features.prioritySupport"),
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

        <div className="max-w-md mx-auto">
          <Card className="gradient-border bg-card/50 backdrop-blur-sm glow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                {t("badge")}
              </div>
              <CardTitle className="text-3xl">{t("title")}</CardTitle>
              <CardDescription>{t("subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" asChild>
                <Link href="/dashboard">{t("badge")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            {t("note")}
            <br />
            {t("note2")}
          </p>
        </div>
      </div>
    </section>
  );
}
