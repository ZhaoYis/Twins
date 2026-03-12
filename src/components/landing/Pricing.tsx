"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Sparkles, Clock, Users, Building2, Star } from "lucide-react";
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
  buttonVariant: "outline" | "default";
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
        t("plans.free.features.communitySupport"),
      ],
      buttonText: t("plans.free.button"),
      buttonVariant: "outline",
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
        t("plans.pro.features.apiAccess"),
      ],
      buttonText: t("plans.pro.button"),
      buttonVariant: "default",
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
        t("plans.enterprise.features.customBranding"),
        t("plans.enterprise.features.dedicatedSupport"),
        t("plans.enterprise.features.sla"),
      ],
      buttonText: t("plans.enterprise.button"),
      buttonVariant: "outline",
    },
  ];

  const highlights = [
    { icon: Zap, value: "∞", label: t("highlights.generation") },
    { icon: Users, value: "99%", label: t("highlights.satisfaction") },
    { icon: Clock, value: "<1s", label: t("highlights.responseTime") },
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
            <span className="text-sm font-medium text-muted-foreground">{t("badge")}</span>
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

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.key} className="relative">
              {/* Glow effect for popular plan */}
              {plan.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-cyan-500 to-purple-500 rounded-3xl blur-lg opacity-20" />
              )}

              <Card className={`relative h-full ${plan.popular ? 'border-2 border-primary/30' : 'border-border'} bg-card/80 backdrop-blur-sm overflow-hidden`}>
                {/* Top gradient bar */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-500 to-purple-500" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      plan.popular
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div className="flex justify-center mb-2">
                    {plan.key === "free" && <Sparkles className="w-6 h-6 text-muted-foreground" />}
                    {plan.key === "pro" && <Star className="w-6 h-6 text-primary" />}
                    {plan.key === "enterprise" && <Building2 className="w-6 h-6 text-purple-500" />}
                  </div>
                  <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className={`text-4xl font-bold ${plan.popular ? 'gradient-text' : ''}`}>{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.priceUnit}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 group">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-muted'
                        } transition-colors`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-sm text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    className={`w-full font-medium h-11 ${
                      plan.popular ? 'btn-primary-tech' : ''
                    }`}
                    variant={plan.buttonVariant}
                    size="lg"
                    asChild
                  >
                    <Link href="/dashboard">
                      {plan.buttonText}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
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
