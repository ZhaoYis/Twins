import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, styleProfiles, users, articles, adminLogs } from "@/lib/db";
import { eq } from "drizzle-orm";

type Params = Promise<{ id: string }>;

// GET /api/admin/profiles/:id - Profile details
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeArticles = searchParams.get("includeArticles") === "true";

    const profile = await db.query.styleProfiles.findFirst({
      where: eq(styleProfiles.id, id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, profile.userId),
    });

    // Get source articles if requested
    let sourceArticles: unknown[] = [];
    if (includeArticles) {
      sourceArticles = await db
        .select({
          id: articles.id,
          title: articles.title,
          sourceType: articles.sourceType,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .where(eq(articles.userId, profile.userId))
        .limit(20);
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        toneAnalysis: profile.toneAnalysis,
        structurePatterns: profile.structurePatterns,
        vocabularyPrefs: profile.vocabularyPrefs,
        writingQuirks: profile.writingQuirks,
        rawAnalysis: profile.rawAnalysis,
        articleCount: profile.articleCount,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
        sourceArticles,
      },
    });
  } catch (error) {
    console.error("Admin profile detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/profiles/:id - Delete profile
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check profile exists
    const existing = await db.query.styleProfiles.findFirst({
      where: eq(styleProfiles.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db.delete(styleProfiles).where(eq(styleProfiles.id, id));

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "profile.delete",
      targetType: "profile",
      targetId: id,
      details: { userId: existing.userId, articleCount: existing.articleCount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin profile delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
