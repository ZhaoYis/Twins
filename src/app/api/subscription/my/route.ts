import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, userSubscriptions, subscriptionPlans } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/subscription/my - Get current user's subscription
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db
      .select({
        id: userSubscriptions.id,
        status: userSubscriptions.status,
        tokensUsed: userSubscriptions.tokensUsed,
        tokensRemaining: userSubscriptions.tokensRemaining,
        currentPeriodStart: userSubscriptions.currentPeriodStart,
        currentPeriodEnd: userSubscriptions.currentPeriodEnd,
        planId: subscriptionPlans.id,
        planName: subscriptionPlans.name,
        planDisplayName: subscriptionPlans.displayName,
        price: subscriptionPlans.price,
        tokensPerMonth: subscriptionPlans.tokensPerMonth,
        maxTeamMembers: subscriptionPlans.maxTeamMembers,
        canAddOwnProviders: subscriptionPlans.canAddOwnProviders,
        features: subscriptionPlans.features,
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(eq(userSubscriptions.userId, session.user.id))
      .limit(1);

    if (subscription.length === 0) {
      // User doesn't have a subscription, return free tier info
      const freePlan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, "free"))
        .limit(1);

      if (freePlan.length > 0) {
        return NextResponse.json({
          subscription: null,
          plan: {
            id: freePlan[0].id,
            name: freePlan[0].name,
            displayName: freePlan[0].displayName,
            tokensPerMonth: freePlan[0].tokensPerMonth,
            maxTeamMembers: freePlan[0].maxTeamMembers,
            canAddOwnProviders: freePlan[0].canAddOwnProviders,
            features: freePlan[0].features || [],
          },
        });
      }

      return NextResponse.json({ subscription: null, plan: null });
    }

    const sub = subscription[0];

    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        tokensUsed: sub.tokensUsed,
        tokensRemaining: sub.tokensRemaining,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        usagePercentage: sub.tokensPerMonth
          ? Math.min(((sub.tokensUsed || 0) / sub.tokensPerMonth) * 100, 100)
          : 0,
      },
      plan: {
        id: sub.planId,
        name: sub.planName,
        displayName: sub.planDisplayName,
        price: sub.price,
        tokensPerMonth: sub.tokensPerMonth,
        maxTeamMembers: sub.maxTeamMembers,
        canAddOwnProviders: sub.canAddOwnProviders,
        features: sub.features || [],
      },
    });
  } catch (error) {
    console.error("Get user subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
