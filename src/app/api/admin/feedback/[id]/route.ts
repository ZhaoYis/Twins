import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, feedbacks, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// PATCH /api/admin/feedback/[id] - Update feedback status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updatedFeedback] = await db
      .update(feedbacks)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedbacks.id, id))
      .returning();

    if (!updatedFeedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ feedback: updatedFeedback });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
