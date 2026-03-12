import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, tokenUsageLogs, users } from "@/lib/db";
import { desc, sql, eq } from "drizzle-orm";

// GET /api/admin/usage - Get token usage statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calculate date range
    const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall stats
    const statsResult = await db
      .select({
        totalTokens: sql<number>`COALESCE(SUM(${tokenUsageLogs.tokensUsed}), 0)`,
        totalRequests: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${tokenUsageLogs.userId})`,
      })
      .from(tokenUsageLogs)
      .where(sql`${tokenUsageLogs.createdAt} >= ${startDate}`);

    const stats = {
      totalTokens: Number(statsResult[0]?.totalTokens || 0),
      totalRequests: Number(statsResult[0]?.totalRequests || 0),
      uniqueUsers: Number(statsResult[0]?.uniqueUsers || 0),
      avgTokensPerRequest:
        statsResult[0]?.totalRequests > 0
          ? Math.round(Number(statsResult[0].totalTokens) / Number(statsResult[0].totalRequests))
          : 0,
    };

    // Get daily usage
    const dailyUsageResult = await db
      .select({
        date: sql<string>`DATE(${tokenUsageLogs.createdAt})`,
        tokens: sql<number>`SUM(${tokenUsageLogs.tokensUsed})`,
        requests: sql<number>`COUNT(*)`,
      })
      .from(tokenUsageLogs)
      .where(sql`${tokenUsageLogs.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${tokenUsageLogs.createdAt})`)
      .orderBy(sql`DATE(${tokenUsageLogs.createdAt})`);

    const dailyUsage = dailyUsageResult.map((row) => ({
      date: row.date,
      tokens: Number(row.tokens),
      requests: Number(row.requests),
    }));

    // Get model usage
    const modelUsageResult = await db
      .select({
        model: tokenUsageLogs.model,
        tokens: sql<number>`SUM(${tokenUsageLogs.tokensUsed})`,
        requests: sql<number>`COUNT(*)`,
      })
      .from(tokenUsageLogs)
      .where(sql`${tokenUsageLogs.createdAt} >= ${startDate}`)
      .groupBy(tokenUsageLogs.model)
      .orderBy(desc(sql`SUM(${tokenUsageLogs.tokensUsed})`));

    const totalModelTokens = modelUsageResult.reduce(
      (sum, row) => sum + Number(row.tokens),
      0
    );

    const modelUsage = modelUsageResult.map((row) => ({
      model: row.model || "Unknown",
      tokens: Number(row.tokens),
      requests: Number(row.requests),
      percentage: totalModelTokens > 0 ? (Number(row.tokens) / totalModelTokens) * 100 : 0,
    }));

    // Get top users
    const userUsageResult = await db
      .select({
        userId: tokenUsageLogs.userId,
        userName: users.name,
        userEmail: users.email,
        tokens: sql<number>`SUM(${tokenUsageLogs.tokensUsed})`,
        requests: sql<number>`COUNT(*)`,
      })
      .from(tokenUsageLogs)
      .leftJoin(users, eq(tokenUsageLogs.userId, users.id))
      .where(sql`${tokenUsageLogs.createdAt} >= ${startDate}`)
      .groupBy(tokenUsageLogs.userId, users.name, users.email)
      .orderBy(desc(sql`SUM(${tokenUsageLogs.tokensUsed})`))
      .limit(10);

    const userUsage = userUsageResult.map((row) => ({
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail || "Unknown",
      tokens: Number(row.tokens),
      requests: Number(row.requests),
    }));

    return NextResponse.json({
      stats,
      dailyUsage,
      modelUsage,
      userUsage,
    });
  } catch (error) {
    console.error("Admin usage stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}
