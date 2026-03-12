"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, MessageSquare, Upload, Brain, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const exampleKeys = ["blog", "email", "social"] as const;

const exampleOutputs: Record<string, Record<string, string>> = {
  blog: {
    zh: `工作方式已经发生了根本性的转变。最初是必需品，现在已经演变成一种偏好——而且理由充分。远程工作不仅仅是避免通勤；而是重新掌控我们的时间和注意力。

但大多数分析忽略了一点：真正的革命不在于我们在哪里工作，而在于我们如何协作。分布式团队正在学习新的节奏、新的仪式，以及在不共享物理空间的情况下建立信任的新方式...`,
    en: `The way we work has fundamentally shifted. What started as a necessity has evolved into a preference—and for good reason. Remote work isn't just about avoiding commutes; it's about reclaiming agency over our time and attention.

But here's what most analyses miss: the real revolution isn't where we work, but how we work together. Distributed teams are learning new rhythms, new rituals, and new ways of building trust without sharing physical space...`,
  },
  email: {
    zh: `你好！

很高兴今天能交流！真的很感谢你介绍了当前工作流程的主要挑战。你提出的集成方面的顾虑非常到位——大多数团队都面临类似的痛点。

我整理了我们讨论内容的快速摘要，还有一些可能有助于澄清技术细节的资源。有任何问题请随时问我...

祝好，
[你的名字]`,
    en: `Hey there,

Great connecting earlier! Really appreciated how you walked through the key challenges with your current workflow. The integration concerns you raised are spot-on—most teams face similar friction points.

I put together a quick summary of what we discussed, plus a few resources that might help clarify the technical bits. Let me know if you have any questions...

Best,
[Your name]`,
  },
  social: {
    zh: `"AI 可以做 X" 和 "AI 应该做 X" 之间的差距变得越来越有趣了。

每周都有新的能力演示让你惊叹——但真正的问题是：这对普通人到底意味着什么？

不是研究人员。不是创始人。只是... 试图完成工作的人。

这才是有趣的地方。`,
    en: `The gap between "AI can do X" and "AI should do X" keeps getting more interesting.

Every week there's a new capability demo that makes you go "wow" - but the real question is: what does this actually unlock for regular people?

Not researchers. Not founders. Just... people trying to get work done.

That's where the interesting stuff happens.`,
  },
};

const steps = [
  { icon: Upload, title: "上传内容", description: "上传你的文章、博客或写作样本" },
  { icon: Brain, title: "风格分析", description: "AI 自动学习你的写作风格" },
  { icon: Sparkles, title: "内容生成", description: "生成符合你风格的新内容" },
];

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const [activeTab, setActiveTab] = useState("blog");

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
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 mb-24 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-foreground" />
                </div>
                <div className="text-lg font-semibold mb-1">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-muted-foreground/30 mx-6 hidden md:block" />
              )}
            </div>
          ))}
        </div>

        {/* Demo tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8 h-14 rounded-xl bg-muted/50">
              {exampleKeys.map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {key === "blog" && <FileText className="w-4 h-4 mr-2" />}
                  {key === "email" && <MessageSquare className="w-4 h-4 mr-2" />}
                  {key === "social" && <Code className="w-4 h-4 mr-2" />}
                  {t(`examples.${key}.title`)}
                </TabsTrigger>
              ))}
            </TabsList>

            {exampleKeys.map((key) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Input card */}
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="text-sm text-muted-foreground font-medium">{t("input")}</div>
                    </div>
                    <div className="text-lg font-medium mb-4">{t(`examples.${key}.input`)}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>风格已识别</span>
                    </div>
                  </div>

                  {/* Output card */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-cyan-500 to-purple-500" />
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div className="text-sm text-muted-foreground font-medium">{t("output")}</div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                        AI 生成
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {exampleOutputs[key]["zh"]}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
