"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Eye, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Content {
  id: string;
  topic: string;
  modelUsed: string | null;
  createdAt: string | null;
  userId: string;
  userEmail: string | null;
  userName: string | null;
}

interface ContentDetail {
  content: {
    id: string;
    topic: string;
    content: string;
    modelUsed: string | null;
    createdAt: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    profile: {
      id: string;
      articleCount: number | null;
    } | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState("");
  const [selectedContent, setSelectedContent] = useState<ContentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchContent = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (modelFilter) params.set("model", modelFilter);

      const res = await fetch(`/api/admin/content?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        setModels(data.models || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  }, [modelFilter]);

  useEffect(() => {
    fetchContent(1);
  }, [fetchContent]);

  const fetchContentDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/content/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedContent(data);
      }
    } catch (error) {
      console.error("Failed to fetch content detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm("确定要删除此内容吗？")) return;
    try {
      await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      fetchContent(pagination.page);
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">内容记录</h1>
        <p className="text-muted-foreground">查看所有生成的内容</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background"
          >
            <option value="">全部模型</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content table */}
      <div className="tech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">主题</th>
                <th className="px-4 py-3 text-left text-sm font-medium">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium">模型</th>
                <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    加载中...
                  </td>
                </tr>
              ) : content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                content.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate font-medium">
                        {item.topic || "无主题"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm">{item.userName || "-"}</div>
                        <div className="text-xs text-muted-foreground">{item.userEmail || "-"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.modelUsed ? (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                          {item.modelUsed}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchContentDetail(item.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteContent(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-sm text-muted-foreground">
              共 {pagination.total} 条记录
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchContent(pagination.page - 1)}
              >
                上一页
              </Button>
              <span className="px-3 py-1 text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchContent(pagination.page + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content detail dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>内容详情</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : selectedContent ? (
            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">用户</div>
                  <div>{selectedContent.content.user?.name || "-"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedContent.content.user?.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">模型</div>
                  <div className="font-mono">{selectedContent.content.modelUsed || "-"}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">主题</div>
                <div className="font-medium">{selectedContent.content.topic}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">生成内容</div>
                <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                  {selectedContent.content.content}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                创建时间:{" "}
                {selectedContent.content.createdAt
                  ? new Date(selectedContent.content.createdAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
