"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, User, Crown, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserSubscription {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  planId: string;
  planName: string;
  planDisplayName: string;
  status: string;
  tokensUsed: number;
  tokensRemaining: number;
  tokensPerMonth: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  tokensPerMonth: number | null;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subsRes, plansRes] = await Promise.all([
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/plans"),
      ]);

      if (subsRes.ok && plansRes.ok) {
        const subsData = await subsRes.json();
        const plansData = await plansRes.json();
        setSubscriptions(subsData.subscriptions);
        setPlans(plansData.plans);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openChangePlanDialog = (sub: UserSubscription) => {
    setSelectedSubscription(sub);
    setSelectedPlanId(sub.planId);
    setDialogOpen(true);
  };

  const handleChangePlan = async () => {
    if (!selectedSubscription) return;

    try {
      await fetch(`/api/admin/subscriptions/${selectedSubscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to change plan:", error);
    }
  };

  const handleResetTokens = async (sub: UserSubscription) => {
    if (!confirm(`确定要重置 ${sub.userEmail} 的Token额度吗？`)) return;

    try {
      await fetch(`/api/admin/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetTokens: true }),
      });
      fetchData();
    } catch (error) {
      console.error("Failed to reset tokens:", error);
    }
  };

  const handleCancelSubscription = async (sub: UserSubscription) => {
    if (!confirm(`确定要取消 ${sub.userEmail} 的订阅吗？`)) return;

    try {
      await fetch(`/api/admin/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      fetchData();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return "无限制";
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("zh-CN");
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-500",
      cancelled: "bg-red-500/10 text-red-500",
      expired: "bg-gray-500/10 text-gray-500",
    };
    const labels: Record<string, string> = {
      active: "活跃",
      cancelled: "已取消",
      expired: "已过期",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用户订阅管理</h1>
          <p className="text-muted-foreground">查看和管理用户订阅状态</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索用户邮箱或名称..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <User className="w-4 h-4" />
            总订阅数
          </div>
          <div className="text-2xl font-bold">{subscriptions.length}</div>
        </div>
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Crown className="w-4 h-4" />
            活跃订阅
          </div>
          <div className="text-2xl font-bold">
            {subscriptions.filter((s) => s.status === "active").length}
          </div>
        </div>
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            专业版
          </div>
          <div className="text-2xl font-bold">
            {subscriptions.filter((s) => s.planName === "pro").length}
          </div>
        </div>
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            企业版
          </div>
          <div className="text-2xl font-bold">
            {subscriptions.filter((s) => s.planName === "enterprise").length}
          </div>
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="tech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">用户</th>
                <th className="text-left px-4 py-3 text-sm font-medium">套餐</th>
                <th className="text-left px-4 py-3 text-sm font-medium">状态</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Token使用</th>
                <th className="text-left px-4 py-3 text-sm font-medium">到期时间</th>
                <th className="text-left px-4 py-3 text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    加载中...
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    暂无订阅记录
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{sub.userName || "未设置"}</div>
                        <div className="text-sm text-muted-foreground">{sub.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm">
                        {sub.planDisplayName}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="font-medium">{formatTokens(sub.tokensUsed)}</span>
                        <span className="text-muted-foreground"> / {formatTokens(sub.tokensPerMonth)}</span>
                      </div>
                      {sub.tokensPerMonth && (
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary rounded-full h-1.5"
                            style={{
                              width: `${Math.min((sub.tokensUsed / sub.tokensPerMonth) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatDate(sub.currentPeriodEnd)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChangePlanDialog(sub)}
                        >
                          更换套餐
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetTokens(sub)}
                        >
                          重置额度
                        </Button>
                        {sub.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(sub)}
                            className="text-red-500 hover:text-red-600"
                          >
                            取消
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更换套餐</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">用户</div>
              <div className="font-medium">{selectedSubscription?.userEmail}</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">选择套餐</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.displayName} ({plan.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleChangePlan} className="btn-primary-tech">
              确认更换
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
