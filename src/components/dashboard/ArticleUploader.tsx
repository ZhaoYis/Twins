"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, FileText, Trash2, Loader2 } from "lucide-react";
import { Article } from "@/lib/db";

interface ArticleUploaderProps {
  articles: Article[];
  onUpload: (article: { title?: string; content: string; sourceType: string; sourceUrl?: string }) => Promise<void>;
  onDelete: (articleId: string) => Promise<void>;
  isLoading: boolean;
}

export function ArticleUploader({ articles, onUpload, onDelete, isLoading }: ArticleUploaderProps) {
  const [url, setUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("url");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      for (const file of acceptedFiles) {
        const text = await file.text();
        await onUpload({
          title: file.name.replace(/\.[^/.]+$/, ""),
          content: text,
          sourceType: "file",
        });
      }
      setUploading(false);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setUploading(true);
    try {
      // Fetch URL content via API
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.content) {
        await onUpload({
          title: data.title || url,
          content: data.content,
          sourceType: "url",
          sourceUrl: url,
        });
        setUrl("");
      }
    } catch (error) {
      console.error("Failed to fetch URL:", error);
    }
    setUploading(false);
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return;
    setUploading(true);
    await onUpload({
      content: pasteText,
      sourceType: "paste",
    });
    setPasteText("");
    setUploading(false);
  };

  return (
    <Card className="gradient-border bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Step 1: Feed Your Articles
        </CardTitle>
        <CardDescription>
          Upload your past writings to train your AI writing twin. Add at least 3 articles for best results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url">
              <Link className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileText className="w-4 h-4 mr-2" />
              File
            </TabsTrigger>
            <TabsTrigger value="paste">
              <Upload className="w-4 h-4 mr-2" />
              Paste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://your-blog.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button onClick={handleUrlSubmit} disabled={uploading || !url.trim()}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="file">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {isDragActive
                  ? "Drop files here..."
                  : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports .txt and .md files (max 5MB)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste your text here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
            />
            <Button onClick={handlePasteSubmit} disabled={uploading || !pasteText.trim()}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Text
            </Button>
          </TabsContent>
        </Tabs>

        {/* Article list */}
        {articles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Uploaded Articles ({articles.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {article.title || "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {article.sourceType} • {article.content.length} chars
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(article.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
