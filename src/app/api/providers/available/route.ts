import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, globalProviders, userApiKeys, userSubscriptions, subscriptionPlans } from "@/lib/db";
import { eq, and } from "drizzle-orm";

interface AvailableProvider {
  id: string;
  type: "platform" | "user";
  provider: string;
  name: string;
  modelName?: string | null;
}

// GET /api/providers/available - Get available providers for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription tier
    const userSubscription = await db
      .select({
        tier: userSubscriptions,
        plan: subscriptionPlans,
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(eq(userSubscriptions.userId, session.user.id))
      .limit(1);

    const userTier = userSubscription[0]?.plan.name || "free";
    const canAddOwnProviders = userSubscription[0]?.plan.canAddOwnProviders || false;

    const availableProviders: AvailableProvider[] = [];

    // Get platform providers that are active and allowed for user's tier
    const platformProviders = await db
      .select()
      .from(globalProviders)
      .where(eq(globalProviders.isActive, true));

    for (const provider of platformProviders) {
      // Check if this provider is allowed for user's tier
      const allowedTiers = provider.allowedTiers as string[] | null;
      if (!allowedTiers || allowedTiers.includes(userTier)) {
        availableProviders.push({
          id: provider.id,
          type: "platform",
          provider: provider.provider,
          name: provider.name,
          modelName: provider.modelName,
        });
      }
    }

    // If user can add own providers, get their personal API keys
    if (canAddOwnProviders) {
      const userKeys = await db
        .select()
        .from(userApiKeys)
        .where(eq(userApiKeys.userId, session.user.id));

      for (const key of userKeys) {
        availableProviders.push({
          id: key.id,
          type: "user",
          provider: key.provider,
          name: `我的 ${key.provider === "openai" ? "OpenAI" : "Anthropic"} Key`,
        });
      }
    }

    return NextResponse.json({
      providers: availableProviders,
      tier: userTier,
      canAddOwnProviders,
    });
  } catch (error) {
    console.error("Get available providers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available providers" },
      { status: 500 }
    );
  }
}
