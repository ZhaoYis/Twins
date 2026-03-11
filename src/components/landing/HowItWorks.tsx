"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, MessageSquare } from "lucide-react";

const examples = {
  blog: {
    icon: FileText,
    title: "Blog Post",
    input: "Write about the future of remote work",
    output: `The way we work has fundamentally shifted. What started as a necessity has evolved into a preference—and for good reason. Remote work isn't just about avoiding commutes; it's about reclaiming agency over our time and attention.

But here's what most analyses miss: the real revolution isn't where we work, but how we work together. Distributed teams are learning new rhythms, new rituals, and new ways of building trust without sharing physical space...`,
  },
  email: {
    icon: MessageSquare,
    title: "Email",
    input: "Follow up on the product demo meeting",
    output: `Hey there,

Great connecting earlier! Really appreciated how you walked through the key challenges with your current workflow. The integration concerns you raised are spot-on—most teams face similar friction points.

I put together a quick summary of what we discussed, plus a few resources that might help clarify the technical bits. Let me know if you have any questions...

Best,
[Your name]`,
  },
  social: {
    icon: Code,
    title: "Social Media",
    input: "Share thoughts on AI development",
    output: `The gap between "AI can do X" and "AI should do X" keeps getting more interesting.

Every week there's a new capability demo that makes you go "wow" - but the real question is: what does this actually unlock for regular people?

Not researchers. Not founders. Just... people trying to get work done.

That's where the interesting stuff happens. 🎯`,
  },
};

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState("blog");

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your AI twin learns your voice and writes content that sounds authentically you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {Object.entries(examples).map(([key, example]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <example.icon className="w-4 h-4" />
                  {example.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(examples).map(([key, example]) => (
              <TabsContent key={key} value={key}>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="gradient-border bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-2">Input</div>
                      <div className="text-lg font-medium">{example.input}</div>
                    </CardContent>
                  </Card>
                  <Card className="gradient-border bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-2">Output (in your style)</div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{example.output}</div>
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
