"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, CreditCard, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  tokensPerMonth: number | null;
  maxTeamMembers: number;
  canAddOwnProviders: boolean;
  features: string[] | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "free",
    displayName: "",
    price: "0",
    tokensPerMonth: "",
    maxTeamMembers: "1",
    canAddOwnProviders: false,
    features: "",
    isActive: true,
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      name: "free",
      displayName: "",
      price: "0",
      tokensPerMonth: "",
      maxTeamMembers: "1",
      canAddOwnProviders: false,
      features: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      price: (plan.price / 100).toString(),
      tokensPerMonth: plan.tokensPerMonth?.toString() || "",
      maxTeamMembers: plan.maxTeamMembers.toString(),
      canAddOwnProviders: plan.canAddOwnProviders,
      features: plan.features?.join("\n") || "",
      isActive: plan.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const features = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name: formData.name,
        displayName: formData.displayName,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        tokensPerMonth: formData.tokensPerMonth ? parseInt(formData.tokensPerMonth) : null,
        maxTeamMembers: parseInt(formData.maxTeamMembers),
        canAddOwnProviders: formData.canAddOwnProviders,
        features: features.length > 0 ? features : null,
        isActive: formData.isActive,
      };

      if (editingPlan) {
        await fetch(`/api/admin/plans/${editingPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
  };

  const togglePlan = async (plan: SubscriptionPlan) => {
    try {
      await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      fetchPlans();
    } catch (error) {
      console.error("Failed to toggle plan:", error);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("确定要删除此套餐吗？")) return;
    try {
      await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      fetchPlans();
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`;
  };

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return "无限制";
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">订阅套餐管理</h1>
          <p className="text-muted-foreground">管理系统订阅套餐配置</p>
        </div>
        <Button onClick={openCreateDialog} className="btn-primary-tech">
          <Plus className="w-4 h-4 mr-2" />
          添加套餐
        </Button>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            加载中...
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            暂无套餐配置
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="tech-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{plan.displayName}</div>
                    <div className="text-sm text-muted-foreground">{plan.name}</div>
                  </div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    plan.isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {plan.isActive ? "活跃" : "已停用"}
                </div>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">价格</span>
                  <span className="font-semibold">{formatPrice(plan.price)}/月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token额度</span>
                  <span>{formatTokens(plan.tokensPerMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">团队成员</span>
                  <span>{plan.maxTeamMembers}人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">自定义API Key</span>
                  <span>{plan.canAddOwnProviders ? "✓" : "✗"}</span>
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="text-xs text-muted-foreground border-t border-border pt-3 mb-3">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="truncate">• {feature}</div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-primary">+{plan.features.length - 3} 更多</div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlan(plan)}
                >
                  {plan.isActive ? (
                    <>
                      <PowerOff className="w-3 h-3 mr-1" />
                      停用
                    </>
                  ) : (
                    <>
                      <Power className="w-3 h-3 mr-1" />
                      启用
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(plan)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePlan(plan.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "编辑套餐" : "添加套餐"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">套餐标识</label>
              <select
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                disabled={!!editingPlan}
              >
                <option value="free">free (免费版)</option>
                <option value="pro">pro (专业版)</option>
                <option value="enterprise">enterprise (企业版)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">显示名称</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="例如: 免费版"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">价格 (元/月)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Token额度/月</label>
                <input
                  type="number"
                  value={formData.tokensPerMonth}
                  onChange={(e) => setFormData({ ...formData, tokensPerMonth: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="留空表示无限制"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">最大团队成员</label>
                <input
                  type="number"
                  value={formData.maxTeamMembers}
                  onChange={(e) => setFormData({ ...formData, maxTeamMembers: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  min="1"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canAddOwnProviders}
                    onChange={(e) => setFormData({ ...formData, canAddOwnProviders: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">允许添加自己的API Key</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">功能特性 (每行一个)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[80px]"
                placeholder="每月 10万 Token 额度&#10;使用平台 AI Provider&#10;基础风格分析"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="btn-primary-tech">
              {editingPlan ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
