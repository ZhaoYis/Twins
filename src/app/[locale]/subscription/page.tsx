"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Crown, Zap, Check, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  priceFormatted: string;
  tokensPerMonth: number | null;
  tokensFormatted: string;
  maxTeamMembers: number;
  canAddOwnProviders: boolean;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  tokensUsed: number;
  tokensRemaining: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  usagePercentage: number;
}

interface SubscriptionData {
  subscription: Subscription | null;
  plan: {
    id: string;
    name: string;
    displayName: string;
    tokensPerMonth: number | null;
    maxTeamMembers: number;
    canAddOwnProviders: boolean;
    features: string[];
  } | null;
}

export default function SubscriptionPage() {
  const t = useTranslations();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch("/api/subscription/my"),
        fetch("/api/subscription/plans"),
      ]);

      if (subRes.ok && plansRes.ok) {
        const subData = await subRes.json();
        const plansData = await plansRes.json();
        setSubscriptionData(subData);
        setPlans(plansData.plans);
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTokens = (tokens: number | null | undefined) => {
    if (!tokens) return "无限制";
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("zh-CN");
  };

  const currentPlan = subscriptionData?.plan;
  const subscription = subscriptionData?.subscription;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">订阅管理</h1>
          <p className="text-muted-foreground">管理您的订阅套餐和使用额度</p>
        </div>

        {/* Current Subscription */}
        <div className="tech-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {loading ? "加载中..." : currentPlan?.displayName || "未订阅"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.name === "free" ? "基础功能" : currentPlan?.name === "pro" ? "专业功能" : "企业功能"}
                </p>
              </div>
            </div>
            {subscription?.status && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === "active"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {subscription.status === "active" ? "活跃" : subscription.status}
              </span>
            )}
          </div>

          {subscription && currentPlan && (
            <div className="space-y-4">
              {/* Token Usage */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Token 使用量</span>
                  <span>
                    {formatTokens(subscription.tokensUsed)} / {formatTokens(currentPlan.tokensPerMonth)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      subscription.usagePercentage > 90
                        ? "bg-red-500"
                        : subscription.usagePercentage > 70
                        ? "bg-yellow-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(subscription.usagePercentage, 100)}%` }}
                  />
                </div>
                {subscription.usagePercentage > 70 && (
                  <p className="text-sm text-yellow-500 mt-2">
                    {subscription.usagePercentage > 90
                      ? "您的 Token 额度即将用尽，请升级套餐"
                      : "Token 使用量较高，请留意"}
                  </p>
                )}
              </div>

              {/* Period */}
              <div className="flex items-center justify-between text-sm border-t border-border pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>计费周期</span>
                </div>
                <span>
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">可用套餐</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                加载中...
              </div>
            ) : (
              plans.map((plan) => {
                const isCurrentPlan = currentPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`tech-card p-6 relative ${
                      isCurrentPlan ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                          当前套餐
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <div className="text-lg font-semibold">{plan.displayName}</div>
                      <div className="text-3xl font-bold mt-2">
                        {plan.price === 0 ? "免费" : plan.priceFormatted}
                        {plan.price > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">/月</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span>{plan.tokensFormatted} Token/月</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>最多 {plan.maxTeamMembers} 名成员</span>
                      </div>
                    </div>

                    {plan.features.length > 0 && (
                      <ul className="space-y-2 mb-6 text-sm">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : "default"}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "当前套餐" : "升级"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
