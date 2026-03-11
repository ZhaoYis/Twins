import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, generatedContent, users } from "@/lib/db";
import { count, sql, eq, desc } from "drizzle-orm";

// GET /api/admin/content - List generated content
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId") || "";
    const model = searchParams.get("model") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];
    if (userId) {
      conditions.push(eq(generatedContent.userId, userId));
    }
    if (model) {
      conditions.push(eq(generatedContent.modelUsed, model));
    }
    if (startDate) {
      conditions.push(sql`${generatedContent.createdAt} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${generatedContent.createdAt} <= ${endDate}`);
    }

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(generatedContent)
      .where(conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined);

    // Get content with user info
    const contentList = await db
      .select({
        id: generatedContent.id,
        topic: generatedContent.topic,
        modelUsed: generatedContent.modelUsed,
        createdAt: generatedContent.createdAt,
        userId: generatedContent.userId,
        userEmail: users.email,
        userName: users.name,
      })
      .from(generatedContent)
      .leftJoin(users, eq(generatedContent.userId, users.id))
      .where(conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined)
      .orderBy(desc(generatedContent.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unique models for filter
    const models = await db
      .selectDistinct({ model: generatedContent.modelUsed })
      .from(generatedContent)
      .where(sql`${generatedContent.modelUsed} IS NOT NULL`);

    return NextResponse.json({
      content: contentList.map((c) => ({
        ...c,
        contentPreview: null, // Don't include content in list
      })),
      models: models.map((m) => m.model).filter(Boolean),
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error("Admin content list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
