import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users, articles, generatedContent, styleProfiles, globalProviders, feedbacks, userSubscriptions, subscriptionPlans, roles, userRoles } from "@/lib/db";
import { count, sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [articleCount] = await db.select({ count: count() }).from(articles);
    const [contentCount] = await db.select({ count: count() }).from(generatedContent);
    const [profileCount] = await db.select({ count: count() }).from(styleProfiles);
    const [providerCount] = await db.select({ count: count() }).from(globalProviders);
    const [feedbackCount] = await db.select({ count: count() }).from(feedbacks);

    // Get content by model
    const contentByModel = await db
      .select({
        model: generatedContent.modelUsed,
        count: count(),
      })
      .from(generatedContent)
      .groupBy(generatedContent.modelUsed);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${sevenDaysAgo}`);

    const [recentContent] = await db
      .select({ count: count() })
      .from(generatedContent)
      .where(sql`${generatedContent.createdAt} >= ${sevenDaysAgo}`);

    // Get active providers
    const activeProviders = await db
      .select()
      .from(globalProviders)
      .where(sql`${globalProviders.isActive} = true`);

    // 用户增长趋势（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await db.execute(sql`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "user"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    // 内容生成趋势（最近30天）
    const contentGrowth = await db.execute(sql`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM generated_content
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    // 用户角色分布
    const userRoleDistribution = await db
      .select({
        role: roles.displayName,
        count: count(),
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .groupBy(roles.id, roles.displayName);

    // 反馈状态分布
    const feedbackDistribution = await db
      .select({
        status: feedbacks.status,
        count: count(),
      })
      .from(feedbacks)
      .groupBy(feedbacks.status);

    // 订阅类型分布
    const subscriptionDistribution = await db
      .select({
        plan: subscriptionPlans.name,
        count: count(),
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(sql`${userSubscriptions.status} = 'active'`)
      .groupBy(subscriptionPlans.id, subscriptionPlans.name);

    return NextResponse.json({
      stats: {
        users: userCount.count,
        articles: articleCount.count,
        content: contentCount.count,
        profiles: profileCount.count,
        providers: providerCount.count,
        feedbacks: feedbackCount.count,
      },
      contentByModel: contentByModel.filter((item) => item.model !== null),
      recentActivity: {
        newUsers: recentUsers.count,
        newContent: recentContent.count,
      },
      activeProviders: activeProviders.map((p) => ({
        id: p.id,
        name: p.name,
        provider: p.provider,
      })),
      userGrowth: Array.isArray(userGrowth) ? userGrowth : [],
      contentGrowth: Array.isArray(contentGrowth) ? contentGrowth : [],
      userRoleDistribution,
      feedbackDistribution,
      subscriptionDistribution,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
