"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Shield, Sparkles, Star, Building2, Zap } from "lucide-react";
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
  gradient: string;
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
      gradient: "from-slate-500 to-slate-600",
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
      gradient: "from-indigo-500 to-purple-500",
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
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section id="pricing" className="py-32 section-muted relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing cards - Bento Grid style */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`bento-card relative ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {/* Gradient top bar for popular */}
              {plan.popular && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient}`} />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                  plan.popular
                    ? "bg-gradient-to-r " + plan.gradient + " text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {plan.popular && <Zap className="w-3 h-3" />}
                  {plan.badge}
                </div>
              )}

              {/* Icon */}
              <div className="mb-4">
                {plan.key === "free" && <Sparkles className="w-6 h-6 text-muted-foreground" />}
                {plan.key === "pro" && <Star className="w-6 h-6 text-primary" />}
                {plan.key === "enterprise" && <Building2 className="w-6 h-6 text-purple-500" />}
              </div>

              {/* Name & Description */}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className={`text-4xl font-bold ${plan.popular ? "gradient-text" : ""}`}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground ml-2">{plan.priceUnit}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className={`w-full h-12 rounded-xl font-semibold ${
                  plan.popular
                    ? "btn-cta"
                    : "btn-secondary"
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
