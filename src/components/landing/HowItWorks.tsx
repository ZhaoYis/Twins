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
  { icon: Brain, title: "风格分析", description: "AI自动学习你的写作风格" },
  { icon: Sparkles, title: "内容生成", description: "生成符合你风格的新内容" },
];

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const [activeTab, setActiveTab] = useState("blog");
  const [locale, setLocale] = useState<"zh" | "en">("zh");

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-card/50 backdrop-blur-sm mb-6">
            <Code className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">工作流程</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Process steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-16 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="tech-card p-6 relative">
                  <div className="icon-container-neon mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-semibold mb-1">{step.title}</div>
                  <div className="text-sm text-muted-foreground text-center">{step.description}</div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-card border-r border-b border-border" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-6 text-primary font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-8 h-8 text-primary/30 mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>

        {/* Demo tabs */}
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 border border-border/50">
              {exampleKeys.map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-2 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  {key === "blog" && <FileText className="w-4 h-4" />}
                  {key === "email" && <MessageSquare className="w-4 h-4" />}
                  {key === "social" && <Code className="w-4 h-4" />}
                  {t(`examples.${key}.title`)}
                </TabsTrigger>
              ))}
            </TabsList>

            {exampleKeys.map((key) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Input card */}
                  <div className="tech-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="text-sm text-muted-foreground font-medium">{t("input")}</div>
                      </div>
                      <div className="text-lg font-medium mb-4">{t(`examples.${key}.input`)}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>风格已识别</span>
                      </div>
                    </CardContent>
                  </div>

                  {/* Output card */}
                  <div className="tech-card relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-500 to-purple-500" />
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="text-sm text-muted-foreground font-medium">{t("output")}</div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                          AI 生成
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 font-mono">
                        {exampleOutputs[key][locale]}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">准备好创建你的 AI 分身了吗？</p>
          <div className="inline-flex items-center gap-4">
            <button className="px-6 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
              查看更多示例
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
