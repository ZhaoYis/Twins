"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
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
    <section className="py-24 section-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border border-border/50 bg-card card-hover">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-medium" size="lg" asChild>
                <Link href="/dashboard">{t("badge")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("note")}
            <br />
            {t("note2")}
          </p>
        </div>
      </div>
    </section>
  );
}
