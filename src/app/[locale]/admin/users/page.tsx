"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, MoreHorizontal, UserCheck, UserX, Shield, Eye, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
  createdAt: string | null;
  roles?: Role[];
}

interface UserDetail {
  user: User;
  stats: {
    articles: number;
    generatedContent: number;
    hasProfile: boolean;
  };
  apiKeys: Array<{
    id: string;
    provider: string;
    createdAt: string | null;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 角色授权相关状态
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoleIds, setUserRoleIds] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const fetchUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (searchEmail) params.set("email", searchEmail);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [searchEmail, roleFilter]);

  useEffect(() => {
    fetchUsers(1);
    fetchAllRoles();
  }, [fetchUsers]);

  const fetchAllRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setAllRoles(data.roles);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const openRolesDialog = async (userId: string) => {
    setSelectedUserId(userId);
    setRolesLoading(true);
    setRolesDialogOpen(true);

    try {
      // 获取用户当前的角色
      const res = await fetch(`/api/admin/users/${userId}/roles`);
      if (res.ok) {
        const data = await res.json();
        setUserRoleIds(data.roles.map((r: Role) => r.id));
      }
    } catch (error) {
      console.error("Failed to fetch user roles:", error);
    } finally {
      setRolesLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setUserRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const saveUserRoles = async () => {
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: userRoleIds }),
      });

      if (res.ok) {
        setRolesDialogOpen(false);
        fetchUsers(pagination.page);
      }
    } catch (error) {
      console.error("Failed to save user roles:", error);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">用户管理</h1>
        <p className="text-muted-foreground">查看和管理所有用户</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索邮箱..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="user">普通用户</option>
        </select>
      </div>

      {/* Users table */}
      <div className="tech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium">角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium">注册时间</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium">
                              {(user.name || user.email)[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name || "-"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role === "admin" ? "管理员" : "用户"}
                        </span>
                        {user.roles && user.roles.length > 0 && (
                          <>
                            {user.roles.map((role) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.displayName}
                              </Badge>
                            ))}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {user.status === "active" ? "正常" : "已禁用"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 rounded-md hover:bg-muted">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => fetchUserDetail(user.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRolesDialog(user.id)}>
                            <Crown className="w-4 h-4 mr-2" />
                            角色授权
                          </DropdownMenuItem>
                          {user.role !== "admin" && (
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, "admin")}>
                              <Shield className="w-4 h-4 mr-2" />
                              设为管理员
                            </DropdownMenuItem>
                          )}
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => updateUserStatus(user.id, "disabled")}
                              className="text-red-500"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              禁用账户
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => updateUserStatus(user.id, "active")}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              启用账户
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                onClick={() => fetchUsers(pagination.page - 1)}
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
                onClick={() => fetchUsers(pagination.page + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {(selectedUser.user.name || selectedUser.user.email)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{selectedUser.user.name || "-"}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.user.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xl font-bold">{selectedUser.stats.articles}</div>
                  <div className="text-xs text-muted-foreground">文章</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xl font-bold">{selectedUser.stats.generatedContent}</div>
                  <div className="text-xs text-muted-foreground">生成内容</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xl font-bold">{selectedUser.apiKeys.length}</div>
                  <div className="text-xs text-muted-foreground">API Keys</div>
                </div>
              </div>
              {selectedUser.apiKeys.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">API Keys</div>
                  <div className="space-y-2">
                    {selectedUser.apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 bg-muted rounded">{key.provider}</span>
                        <span className="text-muted-foreground">
                          {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : "-"}
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

      {/* 角色授权对话框 */}
      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>角色授权</DialogTitle>
          </DialogHeader>
          {rolesLoading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                选择要分配给该用户的角色
              </p>
              <div className="space-y-3">
                {allRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={userRoleIds.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{role.displayName}</div>
                      {role.description && (
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setRolesDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={saveUserRoles}>
                  保存
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
