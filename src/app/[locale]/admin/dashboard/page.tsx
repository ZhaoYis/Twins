"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Dna, Key, Activity, MessageSquare, CreditCard } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  users: number;
  articles: number;
  content: number;
  profiles: number;
  providers: number;
  feedbacks: number;
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

interface GrowthData {
  date: string;
  count: number;
}

interface DistributionData {
  role?: string;
  status?: string;
  plan?: string;
  count: number;
}

interface DashboardData {
  stats: Stats;
  contentByModel: ContentByModel[];
  recentActivity: RecentActivity;
  activeProviders: ActiveProvider[];
  userGrowth: GrowthData[];
  contentGrowth: GrowthData[];
  userRoleDistribution: DistributionData[];
  feedbackDistribution: DistributionData[];
  subscriptionDistribution: DistributionData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
    { label: "用户反馈", value: data?.stats.feedbacks ?? 0, icon: MessageSquare, color: "text-pink-500" },
    { label: "Provider配置", value: data?.stats.providers ?? 0, icon: Key, color: "text-orange-500" },
  ];

  const statusMap: Record<string, string> = {
    pending: '待处理',
    reviewed: '已查看',
    resolved: '已解决',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">系统运营数据概览</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* 趋势图表 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 用户增长趋势 */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">用户增长趋势（最近30天）</h2>
          </div>
          {data?.userGrowth && data.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="新增用户"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-16">暂无数据</div>
          )}
        </div>

        {/* 内容生成趋势 */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">内容生成趋势（最近30天）</h2>
          </div>
          {data?.contentGrowth && data.contentGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.contentGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  name="生成内容"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-16">暂无数据</div>
          )}
        </div>
      </div>

      {/* 分布图表 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 用户角色分布 */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">用户角色分布</h2>
          </div>
          {data?.userRoleDistribution && data.userRoleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.userRoleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                >
                  {data.userRoleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">暂无数据</div>
          )}
        </div>

        {/* 反馈状态分布 */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">反馈状态分布</h2>
          </div>
          {data?.feedbackDistribution && data.feedbackDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.feedbackDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {data.feedbackDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [value, statusMap[name as string] || name]}
                />
                <Legend formatter={(value) => statusMap[value as string] || value} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">暂无数据</div>
          )}
        </div>

        {/* 订阅类型分布 */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">订阅类型分布</h2>
          </div>
          {data?.subscriptionDistribution && data.subscriptionDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="plan"
                >
                  {data.subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">暂无数据</div>
          )}
        </div>
      </div>

      {/* 模型使用分布 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">模型使用分布</h2>
          </div>
          {data?.contentByModel && data.contentByModel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.contentByModel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="model" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" name="使用次数" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-16">暂无数据</div>
          )}
        </div>

        {/* 活跃 Provider */}
        <div className="tech-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">活跃 Provider</h2>
          </div>
          <div className="space-y-3">
            {data?.activeProviders && data.activeProviders.length > 0 ? (
              data.activeProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                    {provider.provider}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm text-center py-8">暂无活跃 Provider</div>
            )}
          </div>

          {/* 最近7天统计 */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium mb-4">最近7天活动</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">
                  {data?.recentActivity.newUsers ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">新用户注册</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-500">
                  {data?.recentActivity.newContent ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">内容生成</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
