"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Key,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
  Crown,
  TrendingUp,
  Server,
  User,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface ApiKey {
  id: string;
  provider: string;
  createdAt: string;
}

interface PlatformProvider {
  id: string;
  type: "platform";
  provider: string;
  name: string;
  modelName?: string | null;
}

interface SubscriptionInfo {
  tier: string;
  canAddOwnProviders: boolean;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [platformProviders, setPlatformProviders] = useState<PlatformProvider[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    subscription: { tokensUsed: number; tokensRemaining: number; status: string } | null;
    plan: { displayName: string; tokensPerMonth: number | null } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [keysRes, providersRes, subRes] = await Promise.all([
        fetch("/api/user/api-key"),
        fetch("/api/providers/available"),
        fetch("/api/subscription/my"),
      ]);

      if (keysRes.ok) {
        const data = await keysRes.json();
        setKeys(data.keys || []);
      }

      if (providersRes.ok) {
        const data = await providersRes.json();
        setPlatformProviders(data.providers.filter((p: PlatformProvider) => p.type === "platform"));
        setSubscriptionInfo({
          tier: data.tier,
          canAddOwnProviders: data.canAddOwnProviders,
        });
      }

      if (subRes.ok) {
        const data = await subRes.json();
        setSubscriptionData(data);
      }
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveKey = async (provider: string, key: string) => {
    if (!key.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key }),
      });

      if (response.ok) {
        setSuccess(t("success.saved", { provider: provider === "openai" ? "OpenAI" : "Anthropic" }));
        if (provider === "openai") setOpenaiKey("");
        else setAnthropicKey("");
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || t("errors.saveFailed"));
      }
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (provider: string) => {
    try {
      const response = await fetch(`/api/user/api-key?provider=${provider}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setKeys((prev) => prev.filter((k) => k.provider !== provider));
        setSuccess(t("success.deleted"));
      }
    } catch {
      setError(t("errors.deleteFailed"));
    }
  };

  const hasKey = (provider: string) => keys.some((k) => k.provider === provider);

  const formatTokens = (tokens: number | null | undefined) => {
    if (!tokens) return "无限制";
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  const canAddOwnProviders = subscriptionInfo?.canAddOwnProviders || false;
  const tierName = subscriptionInfo?.tier || "free";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Status messages */}
          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-green-500">{success}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </div>
          )}

          {/* Subscription Card */}
          <Card className="gradient-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                {t("subscription", { defaultValue: "订阅信息" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    {subscriptionData?.plan?.displayName || "免费版"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tierName === "free" ? "基础功能" : tierName === "pro" ? "专业功能" : "企业功能"}
                  </div>
                </div>
                <Link href="/subscription">
                  <Button variant="outline" size="sm">
                    {t("manageSubscription", { defaultValue: "管理订阅" })}
                  </Button>
                </Link>
              </div>

              {subscriptionData?.subscription && subscriptionData?.plan && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Token 使用量
                    </span>
                    <span>
                      {formatTokens(subscriptionData.subscription.tokensUsed)} /{" "}
                      {formatTokens(subscriptionData.plan.tokensPerMonth)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{
                        width: `${
                          subscriptionData.plan.tokensPerMonth
                            ? Math.min(
                                (subscriptionData.subscription.tokensUsed /
                                  subscriptionData.plan.tokensPerMonth) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Providers Card */}
          <Card className="gradient-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                {t("platformProviders", { defaultValue: "平台 Provider" })}
              </CardTitle>
              <CardDescription>
                {t("platformProvidersDescription", {
                  defaultValue: "由平台提供的 AI Provider，所有用户均可使用",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {platformProviders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t("noPlatformProviders", { defaultValue: "暂无可用平台 Provider" })}
                </div>
              ) : (
                <div className="space-y-3">
                  {platformProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Server className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {provider.provider}
                            {provider.modelName && ` - ${provider.modelName}`}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-500">
                        {t("available", { defaultValue: "可用" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User API Keys Card */}
          <Card className="gradient-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {canAddOwnProviders ? (
                  <Key className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                {t("apiKeys")}
              </CardTitle>
              <CardDescription>
                {canAddOwnProviders
                  ? t("apiKeysDescription")
                  : t("apiKeysUpgradeRequired", {
                      defaultValue: "升级到专业版或企业版可添加您自己的 API Key",
                    })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canAddOwnProviders ? (
                <div className="text-center py-6">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    {t("upgradeForApiKeys", { defaultValue: "升级套餐以使用您自己的 API Key" })}
                  </p>
                  <Link href="/subscription">
                    <Button className="btn-primary-tech">
                      <Crown className="w-4 h-4 mr-2" />
                      {t("viewPlans", { defaultValue: "查看套餐" })}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Tabs defaultValue="openai">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="openai">OpenAI</TabsTrigger>
                    <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
                  </TabsList>

                  <TabsContent value="openai" className="space-y-4 mt-4">
                    {hasKey("openai") ? (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{t("configured")}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey("openai")}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="openai-key">{t("openaiKey")}</Label>
                          <Input
                            id="openai-key"
                            type="password"
                            placeholder="sk-..."
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t("getKey")}{" "}
                            <a
                              href="https://platform.openai.com/api-keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              platform.openai.com
                            </a>
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSaveKey("openai", openaiKey)}
                          disabled={!openaiKey.trim() || saving}
                        >
                          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {t("saveKey", { provider: "OpenAI" })}
                        </Button>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="anthropic" className="space-y-4 mt-4">
                    {hasKey("anthropic") ? (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{t("configured")}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey("anthropic")}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="anthropic-key">{t("anthropicKey")}</Label>
                          <Input
                            id="anthropic-key"
                            type="password"
                            placeholder="sk-ant-..."
                            value={anthropicKey}
                            onChange={(e) => setAnthropicKey(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t("getKey")}{" "}
                            <a
                              href="https://console.anthropic.com/settings/keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              console.anthropic.com
                            </a>
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSaveKey("anthropic", anthropicKey)}
                          disabled={!anthropicKey.trim() || saving}
                        >
                          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {t("saveKey", { provider: "Anthropic" })}
                        </Button>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium mb-2">{t("whyNeedKey")}</h3>
            <p className="text-sm text-muted-foreground">{t("keyExplanation")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
