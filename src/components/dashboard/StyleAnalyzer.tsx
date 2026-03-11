"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, Check, AlertCircle } from "lucide-react";
import { StyleProfile } from "@/lib/db";

interface StyleAnalyzerProps {
  articleCount: number;
  profile: StyleProfile | null;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
}

export function StyleAnalyzer({ articleCount, profile, onAnalyze, isAnalyzing }: StyleAnalyzerProps) {
  const t = useTranslations("dashboard.step2");
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    await onAnalyze();

    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  const canAnalyze = articleCount >= 1;
  const hasProfile = profile !== null;

  const getFormalityLabel = (score: number): string => {
    if (score === undefined) return t("complexity");
    if (score <= 3) return "Casual / 随意";
    if (score <= 6) return "Moderate / 适中";
    return "Formal / 正式";
  };

  return (
    <Card className="border border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Brain className="w-5 h-5 text-primary" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicator */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
          {hasProfile ? (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{t("extracted")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("basedOn", { count: profile.articleCount || articleCount })}
                </p>
              </div>
            </>
          ) : canAnalyze ? (
            <>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium">{t("readyToAnalyze")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("articlesReady", { count: articleCount })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Brain className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">{t("uploadFirst")}</p>
                <p className="text-sm text-muted-foreground">{t("uploadHint")}</p>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        {isAnalyzing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">{t("analyzing")}</p>
          </div>
        )}

        {/* Style profile preview */}
        {hasProfile && !isAnalyzing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">{t("formality")}</p>
              <p className="font-medium capitalize">
                {getFormalityLabel((profile.toneAnalysis as any)?.formality)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">{t("complexity")}</p>
              <p className="font-medium capitalize">
                {(profile.vocabularyPrefs as any)?.complexity || "Moderate / 适中"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">{t("sentenceStyle")}</p>
              <p className="font-medium capitalize">
                {(profile.structurePatterns as any)?.avgSentenceLength > 20 ? "Long / 长" : "Short to Medium / 短到中等"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">{t("articlesAnalyzed")}</p>
              <p className="font-medium">{profile.articleCount || articleCount}</p>
            </div>
          </div>
        )}

        {/* Analyze button */}
        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("analyzing")}
            </>
          ) : hasProfile ? (
            t("reanalyzeButton")
          ) : (
            t("analyzeButton")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
