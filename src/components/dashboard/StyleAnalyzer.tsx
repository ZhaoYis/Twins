"use client";

import { useState } from "react";
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

  return (
    <Card className="gradient-border bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Step 2: Extract Style DNA
        </CardTitle>
        <CardDescription>
          Our AI analyzes your writing to understand your unique voice, tone, and style patterns.
        </CardDescription>
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
                <p className="font-medium">Style DNA Extracted</p>
                <p className="text-sm text-muted-foreground">
                  Based on {profile.articleCount || articleCount} articles
                </p>
              </div>
            </>
          ) : canAnalyze ? (
            <>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium">Ready to Analyze</p>
                <p className="text-sm text-muted-foreground">
                  {articleCount} article{articleCount !== 1 ? "s" : ""} ready for analysis
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Brain className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Upload Articles First</p>
                <p className="text-sm text-muted-foreground">
                  Add at least 1 article to extract your style
                </p>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        {isAnalyzing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Analyzing your writing style...
            </p>
          </div>
        )}

        {/* Style profile preview */}
        {hasProfile && !isAnalyzing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Formality</p>
              <p className="font-medium capitalize">
                {getFormalityLabel((profile.toneAnalysis as any)?.formality)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Complexity</p>
              <p className="font-medium capitalize">
                {(profile.vocabularyPrefs as any)?.complexity || "Moderate"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Sentence Style</p>
              <p className="font-medium capitalize">
                {(profile.structurePatterns as any)?.avgSentenceLength > 20 ? "Long" : "Short to Medium"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Articles Analyzed</p>
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
              Analyzing...
            </>
          ) : hasProfile ? (
            "Re-analyze Style"
          ) : (
            "Analyze My Style"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function getFormalityLabel(score: number): string {
  if (score === undefined) return "Moderate";
  if (score <= 3) return "Casual";
  if (score <= 6) return "Moderate";
  return "Formal";
}
