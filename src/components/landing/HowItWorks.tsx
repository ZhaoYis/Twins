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
} from "lucide-react";

const exampleKeys = ["blog", "email", "social"] as const;

const exampleData = {
  blog: {
    input: "写一篇关于远程工作未来的文章",
    output: `工作方式已经发生了根本性的转变。

最初是必需品，现在已经演变成一种偏好——而且理由充分。远程工作不仅仅是避免通勤；而是重新掌控我们的时间和注意力。

但大多数分析忽略了一点：真正的革命不在于我们在哪里工作，而在于我们如何协作...`,
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    label: "博客文章",
    time: "~30秒",
  },
  email: {
    input: "跟进产品演示会议",
    output: `你好！

很高兴今天能交流！真的很感谢你介绍了当前工作流程的主要挑战。

你提出的集成方面的顾虑非常到位——大多数团队都面临类似的痛点。

我整理了我们讨论内容的快速摘要，还有相关资源...

祝好，
[你的名字]`,
    color: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    label: "电子邮件",
    time: "~10秒",
  },
  social: {
    input: "分享对 AI 发展的看法",
    output: `"AI 可以做 X" 和 "AI 应该做 X" 之间的差距变得越来越有趣了。

每周都有新的能力演示让你惊叹——但真正的问题是：这对普通人到底意味着什么？

不是研究人员。不是创始人。只是... 试图完成工作的人。

这才是有趣的地方。`,
    color: "from-orange-500 to-yellow-500",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    label: "社交媒体",
    time: "~15秒",
  },
};

const steps = [
  { icon: Upload, title: "上传内容", description: "上传你的文章、博客或写作样本" },
  { icon: Brain, title: "风格分析", description: "AI 自动学习你的写作风格" },
  { icon: Sparkles, title: "内容生成", description: "生成符合你风格的新内容" },
];

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
    <section id="how-it-works" className="py-32">
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

        {/* Process steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 mb-20 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center text-center max-w-[180px]">
                <div className="w-14 h-14 rounded-2xl bg-muted dark:bg-muted/50 border border-border dark:border-white/10 flex items-center justify-center mb-3">
                  <step.icon className="w-6 h-6 text-foreground" />
                </div>
                <div className="text-base font-semibold mb-1">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground/30 mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>

        {/* Demo section */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab selector */}
            <TabsList className="w-full mb-8 h-11 p-1 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border dark:border-white/10">
              {exampleKeys.map((key) => {
                const data = exampleData[key];
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="h-9 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center justify-center"
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
                  <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    {/* Input card */}
                    <div className="p-6 rounded-2xl bg-muted/50 dark:bg-muted/20 border border-border dark:border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${data.iconBg}`}>
                          {key === "blog" && <FileText className={`w-4 h-4 ${data.iconColor}`} />}
                          {key === "email" && <MessageSquare className={`w-4 h-4 ${data.iconColor}`} />}
                          {key === "social" && <Hash className={`w-4 h-4 ${data.iconColor}`} />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">输入提示</div>
                        </div>
                      </div>

                      <div className="text-lg font-medium mb-4 leading-relaxed">
                        "{data.input}"
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-border dark:border-white/10">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>风格已识别</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Timer className="w-3.5 h-3.5" />
                          <span>{data.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Output card with animation */}
                    <div className="p-6 rounded-2xl bg-card border border-border dark:border-white/10 relative overflow-hidden">
                      {/* Gradient top bar */}
                      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${data.color}`} />

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <Wand2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="font-medium text-sm">AI 输出</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${data.color} text-white`}>
                          AI 生成
                        </span>
                      </div>

                      {/* Typewriter output */}
                      <div className="min-h-[160px] text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {isGenerating ? (
                          <div className="flex items-center gap-2 text-primary">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs">AI 正在思考...</span>
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
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border dark:border-white/10">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs text-muted-foreground">生成完成</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Bottom hint */}
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground">
              切换不同场景，体验 AI 如何适应你的风格
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
