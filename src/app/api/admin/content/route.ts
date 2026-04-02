import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, generatedContent, users } from "@/lib/db";
import { count, eq, desc, and, gte, lte, isNotNull, type SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
    const userId = searchParams.get("userId") || "";
    const model = searchParams.get("model") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (userId) {
      conditions.push(eq(generatedContent.userId, userId));
    }
    if (model) {
      conditions.push(eq(generatedContent.modelUsed, model));
    }
    if (startDate) {
      const parsed = new Date(startDate);
      if (!isNaN(parsed.getTime())) {
        conditions.push(gte(generatedContent.createdAt, parsed));
      }
    }
    if (endDate) {
      const parsed = new Date(endDate);
      if (!isNaN(parsed.getTime())) {
        conditions.push(lte(generatedContent.createdAt, parsed));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCount] = await db
      .select({ count: count() })
      .from(generatedContent)
      .where(whereClause);

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
      .where(whereClause)
      .orderBy(desc(generatedContent.createdAt))
      .limit(limit)
      .offset(offset);

    const models = await db
      .selectDistinct({ model: generatedContent.modelUsed })
      .from(generatedContent)
      .where(isNotNull(generatedContent.modelUsed));

    return NextResponse.json({
      content: contentList.map((c) => ({
        ...c,
        contentPreview: null,
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
