import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, subscriptionPlans, adminLogs } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/plans/[id] - Get a specific plan
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

    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan: plan[0] });
  } catch (error) {
    console.error("Admin plan get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/plans/[id] - Update a plan
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
    const allowedFields = [
      "displayName",
      "price",
      "tokensPerMonth",
      "maxTeamMembers",
      "canAddOwnProviders",
      "features",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updatedAt = new Date();

    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set(updateData)
      .where(eq(subscriptionPlans.id, id))
      .returning();

    if (!updatedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "plan.update",
      targetType: "plan",
      targetId: id,
      details: updateData,
    });

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error("Admin plan update error:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/plans/[id] - Delete a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if any users are subscribed to this plan
    const { userSubscriptions } = await import("@/lib/db");
    const subscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.planId, id))
      .limit(1);

    if (subscriptions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete plan with active subscriptions" },
        { status: 400 }
      );
    }

    const [deletedPlan] = await db
      .delete(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .returning();

    if (!deletedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "plan.delete",
      targetType: "plan",
      targetId: id,
      details: { name: deletedPlan.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin plan delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
