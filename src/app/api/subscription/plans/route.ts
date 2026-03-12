import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, subscriptionPlans } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/subscription/plans - Get available subscription plans
export async function GET() {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);

    // Transform for display
    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      price: plan.price,
      priceFormatted: `¥${(plan.price / 100).toFixed(2)}`,
      tokensPerMonth: plan.tokensPerMonth,
      tokensFormatted: plan.tokensPerMonth
        ? plan.tokensPerMonth >= 1000000
          ? `${(plan.tokensPerMonth / 1000000).toFixed(0)}M`
          : `${(plan.tokensPerMonth / 1000).toFixed(0)}K`
        : "无限",
      maxTeamMembers: plan.maxTeamMembers,
      canAddOwnProviders: plan.canAddOwnProviders,
      features: plan.features || [],
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
