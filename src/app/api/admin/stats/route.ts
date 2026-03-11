import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users, articles, generatedContent, styleProfiles, globalProviders } from "@/lib/db";
import { count, sql } from "drizzle-orm";

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

    return NextResponse.json({
      stats: {
        users: userCount.count,
        articles: articleCount.count,
        content: contentCount.count,
        profiles: profileCount.count,
        providers: providerCount.count,
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
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
