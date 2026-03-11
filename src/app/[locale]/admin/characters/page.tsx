"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power, PowerOff, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Character {
  id: string;
  name: string;
  description: string | null;
  stylePrompt: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  usageCount: number;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stylePrompt: "",
  });

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/characters");
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters);
      }
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const openCreateDialog = () => {
    setEditingCharacter(null);
    setFormData({ name: "", description: "", stylePrompt: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (c: Character) => {
    setEditingCharacter(c);
    setFormData({
      name: c.name,
      description: c.description || "",
      stylePrompt: c.stylePrompt,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingCharacter) {
        // Update
        await fetch(`/api/admin/characters/${editingCharacter.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            stylePrompt: formData.stylePrompt,
          }),
        });
      } else {
        // Create
        await fetch("/api/admin/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            stylePrompt: formData.stylePrompt,
          }),
        });
      }
      setDialogOpen(false);
      fetchCharacters();
    } catch (error) {
      console.error("Failed to save character:", error);
    }
  };

  const toggleCharacter = async (c: Character) => {
    try {
      await fetch(`/api/admin/characters/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      fetchCharacters();
    } catch (error) {
      console.error("Failed to toggle character:", error);
    }
  };

  const deleteCharacter = async (id: string) => {
    if (!confirm("确定要删除此角色吗？")) return;
    try {
      await fetch(`/api/admin/characters/${id}`, { method: "DELETE" });
      fetchCharacters();
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">角色管理</h1>
          <p className="text-muted-foreground">管理AI角色和写作风格</p>
        </div>
        <Button onClick={openCreateDialog} className="btn-primary-tech">
          <Plus className="w-4 h-4 mr-2" />
          添加角色
        </Button>
      </div>

      {/* Characters grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            加载中...
          </div>
        ) : characters.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            暂无角色定义
          </div>
        ) : (
          characters.map((c) => (
            <div key={c.id} className="tech-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      使用次数: {c.usageCount}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    c.isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {c.isActive ? "启用" : "停用"}
                </div>
              </div>
              {c.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {c.description}
                </p>
              )}
              <div className="p-2 bg-muted/50 rounded text-xs font-mono line-clamp-3 mb-3">
                {c.stylePrompt}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCharacter(c)}
                >
                  {c.isActive ? (
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
                  onClick={() => openEditDialog(c)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCharacter(c.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCharacter ? "编辑角色" : "添加角色"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="例如: 专业科技博主"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">描述</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="角色的简短描述"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">风格提示词</label>
              <textarea
                value={formData.stylePrompt}
                onChange={(e) => setFormData({ ...formData, stylePrompt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[150px] font-mono text-sm"
                placeholder="你是一个专业的科技博主，擅长用简洁清晰的语言解释复杂的技术概念..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="btn-primary-tech">
              {editingCharacter ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
