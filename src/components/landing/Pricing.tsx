"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Free Forever</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Use your own API keys. No usage limits. No hidden fees.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="gradient-border bg-card/50 backdrop-blur-sm glow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                BYOK Model
              </div>
              <CardTitle className="text-3xl">Free</CardTitle>
              <CardDescription>Bring your own API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Unlimited style profiles",
                  "Unlimited article uploads",
                  "Unlimited content generation",
                  "Support for GPT-4 & Claude",
                  "Style DNA extraction",
                  "Streaming responses",
                  "Priority support",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" asChild>
                <Link href="/dashboard">Get Started Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            You&apos;ll need an API key from OpenAI or Anthropic.
            <br />
            Your keys are encrypted and never shared.
          </p>
        </div>
      </div>
    </section>
  );
}
