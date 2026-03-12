"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  MessageSquare,
  Hash,
  Upload,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Wand2,
  Zap,
  Timer,
  Play,
} from "lucide-react";

const exampleKeys = ["blog", "email", "social"] as const;

// Static styling data - labels and inputs will be injected from translations
const exampleStyles = {
  blog: {
    output: `工作方式已经发生了根本性的转变。

最初是必需品，现在已经演变成一种偏好——而且理由充分。远程工作不仅仅是避免通勤；而是重新掌控我们的时间和注意力。

但大多数分析忽略了一点：真正的革命不在于我们在哪里工作，而在于我们如何协作...`,
    gradient: "from-indigo-500 to-purple-500",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconColor: "text-indigo-500",
    time: "~30s",
  },
  email: {
    output: `你好！

很高兴今天能交流！真的很感谢你介绍了当前工作流程的主要挑战。

你提出的集成方面的顾虑非常到位——大多数团队都面临类似的痛点。

我整理了我们讨论内容的快速摘要，还有相关资源...

祝好，
[你的名字]`,
    gradient: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-500",
    time: "~10s",
  },
  social: {
    output: `"AI 可以做 X" 和 "AI 应该做 X" 之间的差距变得越来越有趣了。

每周都有新的能力演示让你惊叹——但真正的问题是：这对普通人到底意味着什么？

不是研究人员。不是创始人。只是... 试图完成工作的人。

这才是有趣的地方。`,
    gradient: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
    iconColor: "text-orange-500",
    time: "~15s",
  },
};

// Typewriter effect hook
function useTypewriter(text: string, isActive: boolean, speed: number = 20) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      setIsComplete(false);
      return;
    }

    let index = 0;
    setDisplayedText("");
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, isActive, speed]);

  return { displayedText, isComplete };
}

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const [activeTab, setActiveTab] = useState("blog");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const steps = [
    { icon: Upload, title: t("steps.upload.title"), description: t("steps.upload.description") },
    { icon: Brain, title: t("steps.analyze.title"), description: t("steps.analyze.description") },
    { icon: Sparkles, title: t("steps.generate.title"), description: t("steps.generate.description") },
  ];

  // Build exampleData with translated labels and inputs
  const exampleData = {
    blog: {
      ...exampleStyles.blog,
      input: t("examples.blog.input"),
      label: t("examples.blog.title"),
    },
    email: {
      ...exampleStyles.email,
      input: t("examples.email.input"),
      label: t("examples.email.title"),
    },
    social: {
      ...exampleStyles.social,
      input: t("examples.social.input"),
      label: t("examples.social.title"),
    },
  };

  const currentData = exampleData[activeTab as keyof typeof exampleData];
  const { displayedText, isComplete } = useTypewriter(
    currentData.output,
    showOutput,
    15
  );

  // Reset animation when tab changes
  useEffect(() => {
    setShowOutput(false);
    setIsGenerating(true);

    const timer = setTimeout(() => {
      setShowOutput(true);
      setIsGenerating(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Process steps */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bento-card text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-base font-semibold mb-1">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo section */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab selector */}
            <TabsList className="w-full mb-8 h-12 p-1 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border dark:border-white/10">
              {exampleKeys.map((key) => {
                const data = exampleData[key];
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="h-10 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center justify-center"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${data.iconBg}`}>
                        {key === "blog" && <FileText className={`w-4 h-4 ${data.iconColor}`} />}
                        {key === "email" && <MessageSquare className={`w-4 h-4 ${data.iconColor}`} />}
                        {key === "social" && <Hash className={`w-4 h-4 ${data.iconColor}`} />}
                      </div>
                      <span className="hidden sm:inline">{data.label}</span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {exampleKeys.map((key) => {
              const data = exampleData[key];
              return (
                <TabsContent key={key} value={key} className="mt-0 outline-none">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Input card */}
                    <div className="bento-card p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${data.gradient}`}>
                          {key === "blog" && <FileText className="w-4 h-4 text-white" />}
                          {key === "email" && <MessageSquare className="w-4 h-4 text-white" />}
                          {key === "social" && <Hash className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{t("inputLabel")}</div>
                          <div className="text-xs text-muted-foreground">{t("yourIdea")}</div>
                        </div>
                      </div>

                      <div className="text-sm font-medium mb-4 leading-relaxed">
                        "{data.input}"
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{t("styleRecognized")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Timer className="w-3 h-3" />
                          <span>{data.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Output card */}
                    <div className="bento-card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                            <Wand2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{t("outputLabel")}</div>
                            <div className="text-xs text-muted-foreground">{t("yourStyle")}</div>
                          </div>
                        </div>
                      </div>

                      {/* Typewriter output */}
                      <div className="min-h-[140px] text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {isGenerating ? (
                          <div className="flex items-center gap-2 text-primary">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs">{t("generating")}</span>
                          </div>
                        ) : (
                          <>
                            {displayedText}
                            {!isComplete && <span className="inline-block w-0.5 h-3 bg-primary animate-pulse ml-0.5" />}
                          </>
                        )}
                      </div>

                      {/* Completion indicator */}
                      {isComplete && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-muted-foreground">{t("complete")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Bottom hint */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Play className="w-4 h-4" />
              {t("switchHint")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
