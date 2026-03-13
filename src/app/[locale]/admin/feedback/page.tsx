"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Feedback {
  id: string;
  email: string;
  content: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/admin/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "待处理", variant: "secondary" as const },
      reviewed: { label: "已查看", variant: "default" as const },
      resolved: { label: "已解决", variant: "default" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用户反馈管理</h1>
        <p className="text-muted-foreground">查看和管理用户提交的反馈</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>反馈列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>邮箱</TableHead>
                <TableHead>反馈内容</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    暂无反馈
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.email}</TableCell>
                    <TableCell className="max-w-md truncate">{feedback.content}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>{formatDate(feedback.createdAt)}</TableCell>
                    <TableCell>
                      <Select
                        value={feedback.status}
                        onValueChange={(value) => {
                          if (value) {
                            updateStatus(feedback.id, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">待处理</SelectItem>
                          <SelectItem value="reviewed">已查看</SelectItem>
                          <SelectItem value="resolved">已解决</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
