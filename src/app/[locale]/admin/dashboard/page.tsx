"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Dna, Key, TrendingUp, Activity } from "lucide-react";

interface Stats {
  users: number;
  articles: number;
  content: number;
  profiles: number;
  providers: number;
}

interface ContentByModel {
  model: string | null;
  count: number;
}

interface RecentActivity {
  newUsers: number;
  newContent: number;
}

interface ActiveProvider {
  id: string;
  name: string;
  provider: string;
}

interface DashboardData {
  stats: Stats;
  contentByModel: ContentByModel[];
  recentActivity: RecentActivity;
  activeProviders: ActiveProvider[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "用户总数", value: data?.stats.users ?? 0, icon: Users, color: "text-blue-500" },
    { label: "文章数量", value: data?.stats.articles ?? 0, icon: FileText, color: "text-green-500" },
    { label: "生成内容", value: data?.stats.content ?? 0, icon: Activity, color: "text-purple-500" },
    { label: "Style档案", value: data?.stats.profiles ?? 0, icon: Dna, color: "text-cyan-500" },
    { label: "Provider配置", value: data?.stats.providers ?? 0, icon: Key, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">系统运营数据概览</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="tech-card p-4">
            <div className={`icon-container-neon mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">最近7天活动</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">新用户注册</span>
              <span className="text-xl font-bold text-blue-500">
                {data?.recentActivity.newUsers ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">内容生成</span>
              <span className="text-xl font-bold text-purple-500">
                {data?.recentActivity.newContent ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Content by Model */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">模型使用分布</h2>
          </div>
          <div className="space-y-3">
            {data?.contentByModel && data.contentByModel.length > 0 ? (
              data.contentByModel.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-muted-foreground font-mono text-sm">
                    {item.model || "Unknown"}
                  </span>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      {/* Active Providers */}
      <div className="tech-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">活跃Provider</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {data?.activeProviders && data.activeProviders.length > 0 ? (
            data.activeProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">{provider.name}</span>
                <span className="text-xs text-muted-foreground">({provider.provider})</span>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">暂无活跃Provider</div>
          )}
        </div>
      </div>
    </div>
  );
}
