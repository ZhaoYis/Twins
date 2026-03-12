import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, userSubscriptions, subscriptionPlans, adminLogs, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/subscriptions/[id] - Get a specific subscription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, id))
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({ subscription: subscription[0] });
  } catch (error) {
    console.error("Admin subscription get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/subscriptions/[id] - Update a subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    // Handle plan change
    if (body.planId) {
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, body.planId))
        .limit(1);

      if (plan.length === 0) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      updateData.planId = body.planId;
      // Reset tokens when changing plan
      updateData.tokensUsed = 0;
      updateData.tokensRemaining = plan[0].tokensPerMonth || 0;
      // Extend period
      updateData.currentPeriodStart = new Date();
      updateData.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Handle token reset
    if (body.resetTokens) {
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.id, id))
        .limit(1);

      if (subscription.length === 0) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }

      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, subscription[0].planId))
        .limit(1);

      if (plan.length > 0) {
        updateData.tokensUsed = 0;
        updateData.tokensRemaining = plan[0].tokensPerMonth || 0;
      }
    }

    // Handle status change
    if (body.status) {
      updateData.status = body.status;
    }

    updateData.updatedAt = new Date();

    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set(updateData)
      .where(eq(userSubscriptions.id, id))
      .returning();

    if (!updatedSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Update user's subscription tier
    if (body.planId) {
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, body.planId))
        .limit(1);

      if (plan.length > 0) {
        await db
          .update(users)
          .set({ subscriptionTier: plan[0].name } as any)
          .where(eq(users.id, updatedSubscription.userId));
      }
    }

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "subscription.update",
      targetType: "subscription",
      targetId: id,
      details: updateData,
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error("Admin subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
