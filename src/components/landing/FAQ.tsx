"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-4 hover:text-foreground transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-muted-foreground leading-relaxed pb-4">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const t = useTranslations("landing.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const faqItems = t.raw("items") as Array<{ question: string; answer: string }>;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setEmail("");
        setContent("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || "提交失败,请稍后重试");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("网络错误,请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background - minimal */}
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Feedback Form */}
        <div className="max-w-xl mx-auto mt-12">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">还有其他问题?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              填写下面的表单,我们会尽快回复您
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div>
                <Textarea
                  placeholder="请描述您的问题或建议..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !email || !content}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    提交反馈
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>感谢您的反馈!我们会尽快回复您。</span>
                </div>
              )}
              {submitStatus === "error" && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
