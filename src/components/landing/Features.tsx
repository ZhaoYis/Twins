"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, PenTool } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Feed Your Articles",
    description: "Upload your past writings via URL, file, or paste text. We support multiple formats and sources.",
  },
  {
    icon: Brain,
    title: "Extract Style DNA",
    description: "Our AI analyzes your writing to understand your tone, structure, vocabulary, and unique quirks.",
  },
  {
    icon: PenTool,
    title: "Generate Content",
    description: "Create new content that matches your writing style perfectly. Blog posts, emails, social media, and more.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three Steps to Your <span className="gradient-text">AI Writing Twin</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Clone your writing style in minutes. No technical knowledge required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="gradient-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
