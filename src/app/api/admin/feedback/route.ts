import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, feedbacks, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/feedback - Get all feedbacks
export async function GET() {
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

    const allFeedbacks = await db
      .select()
      .from(feedbacks)
      .orderBy(feedbacks.createdAt);

    return NextResponse.json({ feedbacks: allFeedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
