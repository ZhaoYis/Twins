import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, generatedContent, users, styleProfiles, adminLogs } from "@/lib/db";
import { eq } from "drizzle-orm";

type Params = Promise<{ id: string }>;

// GET /api/admin/content/:id - Content details
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const content = await db.query.generatedContent.findFirst({
      where: eq(generatedContent.id, id),
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, content.userId),
    });

    // Get style profile if exists
    let profile = null;
    if (content.styleProfileId) {
      profile = await db.query.styleProfiles.findFirst({
        where: eq(styleProfiles.id, content.styleProfileId),
      });
    }

    return NextResponse.json({
      content: {
        id: content.id,
        topic: content.topic,
        content: content.content,
        modelUsed: content.modelUsed,
        createdAt: content.createdAt,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
        profile: profile
          ? {
              id: profile.id,
              articleCount: profile.articleCount,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Admin content detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content/:id - Delete content
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check content exists
    const existing = await db.query.generatedContent.findFirst({
      where: eq(generatedContent.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    await db.delete(generatedContent).where(eq(generatedContent.id, id));

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "content.delete",
      targetType: "content",
      targetId: id,
      details: { topic: existing.topic, userId: existing.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin content delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
