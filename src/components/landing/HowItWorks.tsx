"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, MessageSquare } from "lucide-react";

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

这才是有趣的地方。🎯`,
    en: `The gap between "AI can do X" and "AI should do X" keeps getting more interesting.

Every week there's a new capability demo that makes you go "wow" - but the real question is: what does this actually unlock for regular people?

Not researchers. Not founders. Just... people trying to get work done.

That's where the interesting stuff happens. 🎯`,
  },
};

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const [activeTab, setActiveTab] = useState("blog");

  // Detect current locale from the path or default to zh
  const [locale, setLocale] = useState<"zh" | "en">("zh");

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {exampleKeys.map((key) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  {key === "blog" && <FileText className="w-4 h-4" />}
                  {key === "email" && <MessageSquare className="w-4 h-4" />}
                  {key === "social" && <Code className="w-4 h-4" />}
                  {t(`examples.${key}.title`)}
                </TabsTrigger>
              ))}
            </TabsList>

            {exampleKeys.map((key) => (
              <TabsContent key={key} value={key}>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="gradient-border bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-2">{t("input")}</div>
                      <div className="text-lg font-medium">{t(`examples.${key}.input`)}</div>
                    </CardContent>
                  </Card>
                  <Card className="gradient-border bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-2">{t("output")}</div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {exampleOutputs[key][locale]}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
