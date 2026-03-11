"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Key, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Provider {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  rateLimit: number | null;
  encryptedKey: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    provider: "openai",
    name: "",
    apiKey: "",
    rateLimit: "",
  });

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const openCreateDialog = () => {
    setEditingProvider(null);
    setFormData({ provider: "openai", name: "", apiKey: "", rateLimit: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (p: Provider) => {
    setEditingProvider(p);
    setFormData({
      provider: p.provider,
      name: p.name,
      apiKey: "",
      rateLimit: p.rateLimit?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingProvider) {
        // Update
        const updateData: Record<string, unknown> = {
          name: formData.name,
          rateLimit: formData.rateLimit ? parseInt(formData.rateLimit) : null,
        };
        if (formData.apiKey) {
          updateData.apiKey = formData.apiKey;
        }
        await fetch(`/api/admin/providers/${editingProvider.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
      } else {
        // Create
        await fetch("/api/admin/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: formData.provider,
            name: formData.name,
            apiKey: formData.apiKey,
            rateLimit: formData.rateLimit ? parseInt(formData.rateLimit) : null,
          }),
        });
      }
      setDialogOpen(false);
      fetchProviders();
    } catch (error) {
      console.error("Failed to save provider:", error);
    }
  };

  const toggleProvider = async (p: Provider) => {
    try {
      await fetch(`/api/admin/providers/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      fetchProviders();
    } catch (error) {
      console.error("Failed to toggle provider:", error);
    }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm("确定要删除此Provider吗？")) return;
    try {
      await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
      fetchProviders();
    } catch (error) {
      console.error("Failed to delete provider:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider配置</h1>
          <p className="text-muted-foreground">管理系统级AI提供商配置</p>
        </div>
        <Button onClick={openCreateDialog} className="btn-primary-tech">
          <Plus className="w-4 h-4 mr-2" />
          添加Provider
        </Button>
      </div>

      {/* Providers grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            加载中...
          </div>
        ) : providers.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            暂无Provider配置
          </div>
        ) : (
          providers.map((p) => (
            <div key={p.id} className="tech-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.provider}</div>
                  </div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    p.isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {p.isActive ? "活跃" : "已停用"}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Key</span>
                  <span className="font-mono">{p.encryptedKey}</span>
                </div>
                {p.rateLimit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">速率限制</span>
                    <span>{p.rateLimit} req/min</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleProvider(p)}
                >
                  {p.isActive ? (
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
                  onClick={() => openEditDialog(p)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteProvider(p.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProvider ? "编辑Provider" : "添加Provider"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Provider类型</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                disabled={!!editingProvider}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="例如: Primary OpenAI"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                API Key {editingProvider && "(留空保持不变)"}
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono"
                placeholder="sk-..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">速率限制 (请求/分钟)</label>
              <input
                type="number"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="可选"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="btn-primary-tech">
              {editingProvider ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
