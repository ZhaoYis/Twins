import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users, articles, generatedContent, userApiKeys, styleProfiles, adminLogs } from "@/lib/db";
import { eq, count } from "drizzle-orm";

type Params = Promise<{ id: string }>;

// GET /api/admin/users/:id - User details
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user statistics
    const [articleCount] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.userId, id));

    const [contentCount] = await db
      .select({ count: count() })
      .from(generatedContent)
      .where(eq(generatedContent.userId, id));

    // Get user API keys (masked)
    const apiKeys = await db
      .select({
        id: userApiKeys.id,
        provider: userApiKeys.provider,
        createdAt: userApiKeys.createdAt,
      })
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, id));

    // Check if user has style profile
    const profile = await db.query.styleProfiles.findFirst({
      where: eq(styleProfiles.userId, id),
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      stats: {
        articles: articleCount.count,
        generatedContent: contentCount.count,
        hasProfile: !!profile,
      },
      apiKeys,
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/:id - Update user
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status } = body;

    // Validate input
    if (role && !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (status && !["active", "disabled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updateData: Record<string, string> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    await db.update(users).set(updateData).where(eq(users.id, id));

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: role ? "user.role_update" : "user.status_update",
      targetType: "user",
      targetId: id,
      details: { role, status, previousRole: existingUser.role, previousStatus: existingUser.status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id - Soft delete (disable) user
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete by setting status to disabled
    await db.update(users).set({ status: "disabled" }).where(eq(users.id, id));

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "user.delete",
      targetType: "user",
      targetId: id,
      details: { previousStatus: existingUser.status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
