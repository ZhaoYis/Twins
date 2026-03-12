"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Brain,
  PenTool,
  Check,
  Lock,
  ChevronRight,
  Lightbulb,
  Sparkles,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Article, StyleProfile } from "@/lib/db";

// Step status type
type StepStatus = "locked" | "active" | "completed";

interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: typeof Upload;
  tips: string[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const [articles, setArticles] = useState<Article[]>([]);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Step 1 states
  const [url, setUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [uploading, setUploading] = useState(false);

  // Step 3 states
  const [topic, setTopic] = useState("");
  const [provider, setProvider] = useState("openai");

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, profileRes] = await Promise.all([
          fetch("/api/articles"),
          fetch("/api/style-profile"),
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles || []);
        }

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate step statuses
  const getStepStatus = (step: number): StepStatus => {
    if (step === 1) return "active";
    if (step === 2) return articles.length >= 1 ? "active" : "locked";
    if (step === 3) return profile ? "active" : "locked";
    return "locked";
  };

  // Calculate progress
  const calculateProgress = (): number => {
    let progress = 0;
    if (articles.length >= 1) progress += 33;
    if (profile) progress += 33;
    if (generatedContent) progress += 34;
    return progress;
  };

  // Article upload handlers
  const handleUploadArticle = async (article: {
    title?: string;
    content: string;
    sourceType: string;
    sourceUrl?: string;
  }) => {
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    });

    if (response.ok) {
      const data = await response.json();
      setArticles((prev) => [...prev, data.article]);
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    const response = await fetch(`/api/articles?id=${articleId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    }
  };

  // Analyze handler
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/style-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "openai" }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setActiveStep(3);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate handler
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGeneratedContent("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, provider }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content.content);
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } finally {
      setGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedContent) return;
    await navigator.clipboard.writeText(generatedContent);
  };

  // Get formality label
  const getFormalityLabel = (score: number): string => {
    if (score === undefined) return "适中";
    if (score <= 3) return "随意";
    if (score <= 6) return "适中";
    return "正式";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  const steps: StepConfig[] = [
    {
      id: 1,
      title: "上传文章",
      description: "上传你的过往作品来训练 AI",
      icon: Upload,
      tips: [
        "💡 至少上传 1 篇文章即可开始",
        "💡 建议上传 3-5 篇文章效果更佳",
        "💡 支持通过链接、文件或直接粘贴文本",
      ],
    },
    {
      id: 2,
      title: "提取风格",
      description: "AI 分析你的写作风格",
      icon: Brain,
      tips: [
        "💡 AI 会分析你的语调、结构和词汇",
        "💡 分析过程约需 10-30 秒",
        "💡 完成后可随时重新分析",
      ],
    },
    {
      id: 3,
      title: "生成内容",
      description: "以你的风格创作新内容",
      icon: PenTool,
      tips: [
        "💡 输入你想要写的主题",
        "💡 可以是文章、邮件、社交媒体内容等",
        "💡 生成的内容会模仿你的写作风格",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{t("title")}</h1>
              <span className="text-sm text-muted-foreground">
                完成度 {calculateProgress()}%
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <p className="text-muted-foreground mt-2">
              跟随以下步骤，打造你的 AI 写作双胞胎
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => {
                      if (status !== "locked") setActiveStep(step.id);
                    }}
                    className={`flex flex-col items-center flex-1 ${
                      status === "locked" ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    disabled={status === "locked"}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        status === "completed"
                          ? "bg-green-500 text-white"
                          : status === "active"
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status === "completed" ? (
                        <Check className="w-6 h-6" />
                      ) : status === "locked" ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        status === "active"
                          ? "text-primary"
                          : status === "completed"
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        getStepStatus(step.id + 1) !== "locked"
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Upload Articles */}
            <Card
              className={`transition-all ${
                activeStep === 1
                  ? "ring-2 ring-primary shadow-lg"
                  : "opacity-60"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        articles.length >= 1
                          ? "bg-green-500/10 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {articles.length >= 1 ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        第一步：上传文章
                        {articles.length >= 1 && (
                          <span className="ml-2 text-sm font-normal text-green-500">
                            ✓ 已完成
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        上传你的过往作品，AI 会学习你的写作风格
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tips */}
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>小贴士：</strong>
                      {articles.length === 0
                        ? "点击下方选项卡，通过链接、文件或直接粘贴文本添加你的第一篇文章"
                        : articles.length < 3
                        ? "很好！建议再添加几篇文章（推荐 3-5 篇）效果更佳"
                        : "太棒了！你已经上传了足够的文章，可以进入下一步了"}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".txt,.md";
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          setUploading(true);
                          const text = await file.text();
                          await handleUploadArticle({
                            title: file.name.replace(/\.[^/.]+$/, ""),
                            content: text,
                            sourceType: "file",
                          });
                          setUploading(false);
                        }
                      };
                      input.click();
                    }}
                    className="p-4 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                    disabled={uploading}
                  >
                    <FileText className="w-6 h-6 mx-auto mb-1 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm">上传文件</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = prompt("请输入文章链接：");
                      if (url) {
                        setUploading(true);
                        fetch("/api/fetch-url", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url }),
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.content) {
                              return handleUploadArticle({
                                title: data.title || url,
                                content: data.content,
                                sourceType: "url",
                                sourceUrl: url,
                              });
                            }
                          })
                          .finally(() => setUploading(false));
                      }
                    }}
                    className="p-4 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                    disabled={uploading}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm">粘贴链接</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = prompt("请粘贴你的文章内容：");
                      if (text) {
                        setUploading(true);
                        handleUploadArticle({
                          content: text,
                          sourceType: "paste",
                        }).finally(() => setUploading(false));
                      }
                    }}
                    className="p-4 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                    disabled={uploading}
                  >
                    <PenTool className="w-6 h-6 mx-auto mb-1 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm">粘贴文本</span>
                  </button>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">上传中...</span>
                  </div>
                )}

                {/* Article list */}
                {articles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      已上传文章 ({articles.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {articles.map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {article.title || "未命名文章"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {article.content.length} 字
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            <span className="text-muted-foreground hover:text-destructive">×</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next step button */}
                {articles.length >= 1 && (
                  <Button
                    className="w-full"
                    onClick={() => setActiveStep(2)}
                  >
                    下一步：提取风格
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Analyze Style */}
            <Card
              className={`transition-all ${
                activeStep === 2
                  ? "ring-2 ring-primary shadow-lg"
                  : getStepStatus(2) === "locked"
                  ? "opacity-40"
                  : "opacity-60"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      profile
                        ? "bg-green-500/10 text-green-500"
                        : articles.length >= 1
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {profile ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Brain className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      第二步：提取风格 DNA
                      {profile && (
                        <span className="ml-2 text-sm font-normal text-green-500">
                          ✓ 已完成
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      AI 分析你的写作风格，提取独特的声音和语调
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {getStepStatus(2) === "locked" ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      请先上传至少 1 篇文章
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tips */}
                    <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          <strong>提示：</strong>
                          {profile
                            ? "你的风格 DNA 已提取！可以点击「重新分析」更新，或进入下一步开始生成内容"
                            : "点击下方按钮，AI 将分析你上传的文章，提取你的写作风格特征"}
                        </div>
                      </div>
                    </div>

                    {/* Style profile preview */}
                    {profile && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">正式程度</p>
                          <p className="font-medium">
                            {getFormalityLabel((profile.toneAnalysis as any)?.formality)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">词汇复杂度</p>
                          <p className="font-medium">
                            {(profile.vocabularyPrefs as any)?.complexity || "适中"}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">句式风格</p>
                          <p className="font-medium">
                            {(profile.structurePatterns as any)?.avgSentenceLength > 20
                              ? "长句为主"
                              : "短中句"}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">分析文章数</p>
                          <p className="font-medium">{profile.articleCount || articles.length}</p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleAnalyze}
                        disabled={analyzing}
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            分析中...
                          </>
                        ) : profile ? (
                          "重新分析"
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            开始分析
                          </>
                        )}
                      </Button>
                      {profile && (
                        <Button variant="outline" onClick={() => setActiveStep(3)}>
                          下一步
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Generate Content */}
            <Card
              className={`transition-all ${
                activeStep === 3
                  ? "ring-2 ring-primary shadow-lg"
                  : getStepStatus(3) === "locked"
                  ? "opacity-40"
                  : "opacity-60"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      generatedContent
                        ? "bg-green-500/10 text-green-500"
                        : profile
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {generatedContent ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <PenTool className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      第三步：生成内容
                      {generatedContent && (
                        <span className="ml-2 text-sm font-normal text-green-500">
                          ✓ 完成
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      输入主题，让 AI 以你的风格创作内容
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {getStepStatus(3) === "locked" ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      请先完成风格提取
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tips */}
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                      <div className="flex items-start gap-2">
                        <PenTool className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-green-600 dark:text-green-400">
                          <strong>准备好了！</strong>
                          输入你想写的主题，AI 会用你的写作风格来创作。可以是博客文章、邮件、社交媒体内容等。
                        </div>
                      </div>
                    </div>

                    {/* Topic input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">主题</label>
                      <textarea
                        placeholder="例如：写一篇关于远程工作未来趋势的文章..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={generating}
                      />
                    </div>

                    {/* Provider and generate button */}
                    <div className="flex gap-2">
                      <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-background"
                        disabled={generating}
                      >
                        <option value="openai">OpenAI (GPT-4)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                      </select>
                      <Button
                        className="flex-1"
                        onClick={handleGenerate}
                        disabled={!topic.trim() || generating}
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            生成内容
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Generated content */}
                    {generatedContent && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">生成的内容</label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                              复制
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleGenerate}
                              disabled={generating}
                            >
                              重新生成
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border max-h-80 overflow-y-auto">
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                            {generatedContent}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
