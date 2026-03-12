import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, subscriptionPlans, adminLogs } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

// GET /api/admin/plans - List all subscription plans
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plans = await db
      .select()
      .from(subscriptionPlans)
      .orderBy(desc(subscriptionPlans.createdAt));

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Admin plans list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST /api/admin/plans - Create a new subscription plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      displayName,
      price,
      tokensPerMonth,
      maxTeamMembers,
      canAddOwnProviders,
      features,
      isActive,
    } = body;

    // Validate
    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and displayName are required" },
        { status: 400 }
      );
    }

    if (!["free", "pro", "enterprise"].includes(name)) {
      return NextResponse.json(
        { error: "Invalid plan name. Must be 'free', 'pro', or 'enterprise'" },
        { status: 400 }
      );
    }

    // Check if plan with same name already exists
    const existing = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Plan with this name already exists" },
        { status: 400 }
      );
    }

    // Create plan
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values({
        name,
        displayName,
        price: price || 0,
        tokensPerMonth: tokensPerMonth || null,
        maxTeamMembers: maxTeamMembers || 1,
        canAddOwnProviders: canAddOwnProviders || false,
        features: features || null,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "plan.create",
      targetType: "plan",
      targetId: newPlan.id,
      details: { name, displayName },
    });

    return NextResponse.json({ plan: newPlan });
  } catch (error) {
    console.error("Admin plan create error:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
