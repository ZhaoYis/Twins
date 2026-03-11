"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Loader2, Check, AlertCircle, Trash2 } from "lucide-react";

interface ApiKey {
  id: string;
  provider: string;
  createdAt: string;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/user/api-key");
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch {
      console.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

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
        fetchKeys();
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Status messages */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-green-500">{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </div>
          )}

          <Card className="gradient-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                {t("apiKeys")}
              </CardTitle>
              <CardDescription>
                {t("apiKeysDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-medium mb-2">{t("whyNeedKey")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("keyExplanation")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
