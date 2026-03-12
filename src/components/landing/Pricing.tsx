"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Sparkles, Star, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";

type PlanKey = "free" | "pro" | "enterprise";

interface Plan {
  key: PlanKey;
  name: string;
  price: string;
  priceUnit: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
}

export function Pricing() {
  const t = useTranslations("landing.pricing");

  const plans: Plan[] = [
    {
      key: "free",
      name: t("plans.free.name"),
      price: "¥0",
      priceUnit: t("plans.free.priceUnit"),
      description: t("plans.free.description"),
      badge: t("plans.free.badge"),
      features: [
        t("plans.free.features.ownKey"),
        t("plans.free.features.unlimitedProfiles"),
        t("plans.free.features.unlimitedArticles"),
        t("plans.free.features.unlimitedGeneration"),
        t("plans.free.features.styleDNA"),
        t("plans.free.features.streaming"),
      ],
      buttonText: t("plans.free.button"),
    },
    {
      key: "pro",
      name: t("plans.pro.name"),
      price: "¥99",
      priceUnit: t("plans.pro.priceUnit"),
      description: t("plans.pro.description"),
      badge: t("plans.pro.badge"),
      popular: true,
      features: [
        t("plans.pro.features.includedTokens"),
        t("plans.pro.features.multipleModels"),
        t("plans.pro.features.unlimitedProfiles"),
        t("plans.pro.features.styleDNA"),
        t("plans.pro.features.streaming"),
        t("plans.pro.features.prioritySupport"),
      ],
      buttonText: t("plans.pro.button"),
    },
    {
      key: "enterprise",
      name: t("plans.enterprise.name"),
      price: "¥399",
      priceUnit: t("plans.enterprise.priceUnit"),
      description: t("plans.enterprise.description"),
      badge: t("plans.enterprise.badge"),
      features: [
        t("plans.enterprise.features.includedTokens"),
        t("plans.enterprise.features.teamMembers"),
        t("plans.enterprise.features.sharedProfiles"),
        t("plans.enterprise.features.adminDashboard"),
        t("plans.enterprise.features.dedicatedSupport"),
        t("plans.enterprise.features.sla"),
      ],
      buttonText: t("plans.enterprise.button"),
    },
  ];

  return (
    <section id="pricing" className="py-32 bg-muted/20">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-foreground text-background"
                  : "bg-card border border-border/50"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-6 ${
                  plan.popular
                    ? "bg-background/10 text-background"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Icon */}
              <div className="mb-4">
                {plan.key === "free" && <Sparkles className="w-6 h-6" />}
                {plan.key === "pro" && <Star className="w-6 h-6" />}
                {plan.key === "enterprise" && <Building2 className="w-6 h-6" />}
              </div>

              {/* Name & Description */}
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`ml-2 ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                  {plan.priceUnit}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-background/80" : "text-primary"}`} />
                    <span className={`text-sm ${plan.popular ? "text-background/90" : ""}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className={`w-full h-12 rounded-full font-medium ${
                  plan.popular
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
                asChild
              >
                <Link href="/dashboard">{plan.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-sm">{t("note")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
