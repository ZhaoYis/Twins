"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/Header";
import { ArticleUploader } from "@/components/dashboard/ArticleUploader";
import { StyleAnalyzer } from "@/components/dashboard/StyleAnalyzer";
import { ContentGenerator } from "@/components/dashboard/ContentGenerator";
import { Article, StyleProfile } from "@/lib/db";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const [articles, setArticles] = useState<Article[]>([]);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async (topic: string, provider: string): Promise<string> => {
    setGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, provider }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content.content;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } finally {
      setGenerating(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            <ArticleUploader
              articles={articles}
              onUpload={handleUploadArticle}
              onDelete={handleDeleteArticle}
              isLoading={loading}
            />

            <StyleAnalyzer
              articleCount={articles.length}
              profile={profile}
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzing}
            />

            <ContentGenerator
              profile={profile}
              onGenerate={handleGenerate}
              isGenerating={generating}
              generatedContent={generatedContent}
              setGeneratedContent={setGeneratedContent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
