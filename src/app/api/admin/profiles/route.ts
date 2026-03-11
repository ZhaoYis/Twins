import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, styleProfiles, users } from "@/lib/db";
import { count, sql, eq, desc } from "drizzle-orm";

// GET /api/admin/profiles - List style profiles
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const minArticles = searchParams.get("minArticles") || "";

    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];
    if (minArticles) {
      conditions.push(sql`${styleProfiles.articleCount} >= ${parseInt(minArticles)}`);
    }

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(styleProfiles)
      .where(conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined);

    // Get profiles with user info
    const profilesList = await db
      .select({
        id: styleProfiles.id,
        articleCount: styleProfiles.articleCount,
        createdAt: styleProfiles.createdAt,
        updatedAt: styleProfiles.updatedAt,
        userId: styleProfiles.userId,
        userEmail: users.email,
        userName: users.name,
        toneAnalysis: styleProfiles.toneAnalysis,
      })
      .from(styleProfiles)
      .leftJoin(users, eq(styleProfiles.userId, users.id))
      .where(conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined)
      .orderBy(desc(styleProfiles.updatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      profiles: profilesList.map((p) => ({
        ...p,
        formality: p.toneAnalysis?.formality ?? null,
      })),
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error("Admin profiles list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
