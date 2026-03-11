"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { StyleProfile } from "@/lib/db";

interface ContentGeneratorProps {
  profile: StyleProfile | null;
  onGenerate: (topic: string, provider: string) => Promise<string>;
  isGenerating: boolean;
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
}

export function ContentGenerator({
  profile,
  onGenerate,
  isGenerating,
  generatedContent,
  setGeneratedContent,
}: ContentGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [provider, setProvider] = useState("openai");
  const [copied, setCopied] = useState(false);

  const canGenerate = profile !== null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGeneratedContent("");
    const content = await onGenerate(topic, provider);
    setGeneratedContent(content);
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="gradient-border bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-primary" />
          Step 3: Generate Content
        </CardTitle>
        <CardDescription>
          Enter a topic and let your AI writing twin create content in your unique style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic or Subject</label>
            <Textarea
              placeholder="E.g., Write about the future of AI in healthcare..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              disabled={!canGenerate || isGenerating}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">AI Provider</label>
              <Select value={provider} onValueChange={(value) => value && setProvider(value)} disabled={!canGenerate || isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating || !topic.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        {!canGenerate && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <PenTool className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Extract Your Style First</p>
              <p className="text-sm text-muted-foreground">
                Complete Step 2 to generate content in your style
              </p>
            </div>
          </div>
        )}

        {/* Output section */}
        {generatedContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Content</label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {generatedContent}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isGenerating && !generatedContent && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Writing in your style...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
