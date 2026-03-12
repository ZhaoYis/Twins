import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, userSubscriptions, subscriptionPlans, users } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

// GET /api/admin/subscriptions - List all user subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subscriptions = await db
      .select({
        id: userSubscriptions.id,
        userId: userSubscriptions.userId,
        userName: users.name,
        userEmail: users.email,
        planId: userSubscriptions.planId,
        status: userSubscriptions.status,
        tokensUsed: userSubscriptions.tokensUsed,
        tokensRemaining: userSubscriptions.tokensRemaining,
        currentPeriodStart: userSubscriptions.currentPeriodStart,
        currentPeriodEnd: userSubscriptions.currentPeriodEnd,
        createdAt: userSubscriptions.createdAt,
        planName: subscriptionPlans.name,
        planDisplayName: subscriptionPlans.displayName,
        tokensPerMonth: subscriptionPlans.tokensPerMonth,
      })
      .from(userSubscriptions)
      .innerJoin(users, eq(userSubscriptions.userId, users.id))
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .orderBy(desc(userSubscriptions.createdAt));

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Admin subscriptions list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
