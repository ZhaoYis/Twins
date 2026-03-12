"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Users, Cpu, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageStats {
  totalTokens: number;
  totalRequests: number;
  uniqueUsers: number;
  avgTokensPerRequest: number;
}

interface DailyUsage {
  date: string;
  tokens: number;
  requests: number;
}

interface ModelUsage {
  model: string;
  tokens: number;
  requests: number;
  percentage: number;
}

interface UserUsage {
  userId: string;
  userName: string | null;
  userEmail: string;
  tokens: number;
  requests: number;
}

export default function AdminUsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usage?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setDailyUsage(data.dailyUsage);
        setModelUsage(data.modelUsage);
        setUserUsage(data.userUsage);
      }
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const maxDailyTokens = Math.max(...dailyUsage.map((d) => d.tokens), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Token 使用统计</h1>
          <p className="text-muted-foreground">查看系统 Token 使用情况</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
              className={dateRange === range ? "btn-primary-tech" : ""}
            >
              {range === "7d" ? "近7天" : range === "30d" ? "近30天" : "近90天"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            总Token使用
          </div>
          <div className="text-2xl font-bold">
            {loading ? "-" : formatTokens(stats?.totalTokens || 0)}
          </div>
        </div>
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Cpu className="w-4 h-4" />
            总请求数
          </div>
          <div className="text-2xl font-bold">
            {loading ? "-" : stats?.totalRequests.toLocaleString() || 0}
          </div>
        </div>
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Users className="w-4 h-4" />
            活跃用户
          </div>
          <div className="text-2xl font-bold">
            {loading ? "-" : stats?.uniqueUsers || 0}
          </div>
        </div>
        <div className="tech-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="w-4 h-4" />
            平均每次请求
          </div>
          <div className="text-2xl font-bold">
            {loading ? "-" : formatTokens(stats?.avgTokensPerRequest || 0)}
          </div>
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="tech-card p-4">
        <h3 className="font-semibold mb-4">每日使用趋势</h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            加载中...
          </div>
        ) : dailyUsage.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {dailyUsage.map((day, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-primary/20 rounded-t hover:bg-primary/40 transition-colors relative group"
                  style={{ height: `${(day.tokens / maxDailyTokens) * 100}%`, minHeight: "4px" }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatTokens(day.tokens)} tokens
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(day.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Model Usage */}
        <div className="tech-card p-4">
          <h3 className="font-semibold mb-4">模型使用分布</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              加载中...
            </div>
          ) : modelUsage.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <div className="space-y-3">
              {modelUsage.map((model, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{model.model || "未知模型"}</span>
                    <span className="text-muted-foreground">
                      {formatTokens(model.tokens)} ({model.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${model.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Users */}
        <div className="tech-card p-4">
          <h3 className="font-semibold mb-4">用户使用排行</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              加载中...
            </div>
          ) : userUsage.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <div className="space-y-2">
              {userUsage.slice(0, 10).map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{user.userName || "未设置"}</div>
                      <div className="text-xs text-muted-foreground">{user.userEmail}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatTokens(user.tokens)}</div>
                    <div className="text-xs text-muted-foreground">{user.requests} 请求</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
