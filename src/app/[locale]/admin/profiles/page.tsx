"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Trash2, Dna, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  articleCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  formality: number | null;
}

interface ProfileDetail {
  profile: {
    id: string;
    toneAnalysis: {
      formality: number;
      emotionalTone: string[];
      audienceAwareness: string;
    } | null;
    structurePatterns: {
      avgSentenceLength: number;
      avgParagraphLength: number;
      transitionStyle: string;
      organizationPattern: string;
    } | null;
    vocabularyPrefs: {
      complexity: string;
      technicalLevel: string;
      commonPhrases: string[];
      wordPreferences: string[];
    } | null;
    writingQuirks: {
      punctuationStyle: string;
      signaturePhrases: string[];
      uniqueElements: string[];
    } | null;
    rawAnalysis: string | null;
    articleCount: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    sourceArticles: Array<{
      id: string;
      title: string | null;
      sourceType: string | null;
      createdAt: string | null;
    }>;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchProfiles = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/admin/profiles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles(1);
  }, [fetchProfiles]);

  const fetchProfileDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/profiles/${id}?includeArticles=true`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("确定要删除此Style档案吗？")) return;
    try {
      await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
      fetchProfiles(pagination.page);
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  const getFormalityLabel = (value: number | null) => {
    if (value === null) return "-";
    if (value >= 8) return "非常正式";
    if (value >= 6) return "正式";
    if (value >= 4) return "中等";
    if (value >= 2) return "随意";
    return "非常随意";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Style DNA</h1>
        <p className="text-muted-foreground">查看用户的风格DNA档案</p>
      </div>

      {/* Profiles table */}
      <div className="tech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium">文章数</th>
                <th className="px-4 py-3 text-left text-sm font-medium">正式程度</th>
                <th className="px-4 py-3 text-left text-sm font-medium">更新时间</th>
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
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{profile.userName || "-"}</div>
                        <div className="text-xs text-muted-foreground">{profile.userEmail || "-"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.articleCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {profile.formality !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(profile.formality / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{getFormalityLabel(profile.formality)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchProfileDetail(profile.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProfile(profile.id)}
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
                onClick={() => fetchProfiles(pagination.page - 1)}
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
                onClick={() => fetchProfiles(pagination.page + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile detail dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-primary" />
              Style DNA 详情
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : selectedProfile ? (
            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">用户</div>
                  <div className="font-medium">{selectedProfile.profile.user?.name || "-"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedProfile.profile.user?.email}
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">文章数</div>
                  <div className="text-2xl font-bold">{selectedProfile.profile.articleCount ?? 0}</div>
                </div>
              </div>

              {/* Tone Analysis */}
              {selectedProfile.profile.toneAnalysis && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    语调分析
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">正式程度</div>
                      <div className="font-medium">
                        {getFormalityLabel(selectedProfile.profile.toneAnalysis.formality)}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">目标受众</div>
                      <div className="font-medium text-sm">
                        {selectedProfile.profile.toneAnalysis.audienceAwareness || "-"}
                      </div>
                    </div>
                  </div>
                  {selectedProfile.profile.toneAnalysis.emotionalTone?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.profile.toneAnalysis.emotionalTone.map((tone, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 rounded text-xs">
                          {tone}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Writing Quirks */}
              {selectedProfile.profile.writingQuirks && (
                <div className="space-y-2">
                  <h4 className="font-medium">写作特点</h4>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">标点风格:</span>{" "}
                      {selectedProfile.profile.writingQuirks.punctuationStyle || "-"}
                    </div>
                    {selectedProfile.profile.writingQuirks.signaturePhrases?.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">标志性短语:</span>{" "}
                        {selectedProfile.profile.writingQuirks.signaturePhrases.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Source Articles */}
              {selectedProfile.profile.sourceArticles?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">来源文章</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedProfile.profile.sourceArticles.map((article) => (
                      <div key={article.id} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate flex-1">{article.title || "无标题"}</span>
                        <span className="text-xs text-muted-foreground">
                          {article.sourceType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
