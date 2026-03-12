import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  db,
  styleProfiles,
  generatedContent,
  userApiKeys,
  globalProviders,
  userSubscriptions,
  subscriptionPlans,
  tokenUsageLogs,
} from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { generateContent as generateWithAI, streamGenerateContent } from "@/lib/ai/content-generator";
import { generateContentSchema, AIProvider } from "@/types";

interface ProviderInfo {
  type: "platform" | "user";
  apiKey: string;
  provider: string;
  providerId: string;
  modelName?: string | null;
}

async function getProviderInfo(
  userId: string,
  requestedProviderId?: string
): Promise<ProviderInfo | null> {
  // Get user's subscription
  const [subscription] = await db
    .select({
      subscription: userSubscriptions,
      plan: subscriptionPlans,
    })
    .from(userSubscriptions)
    .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  const userTier = subscription?.plan.name || "free";
  const canAddOwnProviders = subscription?.plan.canAddOwnProviders || false;

  // If a specific provider ID is requested
  if (requestedProviderId) {
    // Check if it's a user API key
    const [userKey] = await db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.id, requestedProviderId),
          eq(userApiKeys.userId, userId)
        )
      )
      .limit(1);

    if (userKey) {
      if (!canAddOwnProviders) {
        return null; // User's tier doesn't allow own providers
      }
      return {
        type: "user",
        apiKey: decrypt(userKey.encryptedKey),
        provider: userKey.provider,
        providerId: userKey.id,
      };
    }

    // Check if it's a platform provider
    const [platformProvider] = await db
      .select()
      .from(globalProviders)
      .where(
        and(
          eq(globalProviders.id, requestedProviderId),
          eq(globalProviders.isActive, true)
        )
      )
      .limit(1);

    if (platformProvider) {
      // Check if user's tier is allowed
      const allowedTiers = platformProvider.allowedTiers as string[] | null;
      if (allowedTiers && !allowedTiers.includes(userTier)) {
        return null;
      }

      return {
        type: "platform",
        apiKey: decrypt(platformProvider.encryptedKey),
        provider: platformProvider.provider,
        providerId: platformProvider.id,
        modelName: platformProvider.modelName,
      };
    }

    return null;
  }

  // No specific provider requested - use default logic
  // For free users, use first available platform provider
  // For paid users, prefer their own key if available

  if (canAddOwnProviders) {
    // Try to get user's own API key first
    const [userKey] = await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId))
      .limit(1);

    if (userKey) {
      return {
        type: "user",
        apiKey: decrypt(userKey.encryptedKey),
        provider: userKey.provider,
        providerId: userKey.id,
      };
    }
  }

  // Fall back to platform provider
  const [platformProvider] = await db
    .select()
    .from(globalProviders)
    .where(eq(globalProviders.isActive, true))
    .limit(1);

  if (!platformProvider) {
    return null;
  }

  // Check if user's tier is allowed
  const allowedTiers = platformProvider.allowedTiers as string[] | null;
  if (allowedTiers && !allowedTiers.includes(userTier)) {
    return null;
  }

  return {
    type: "platform",
    apiKey: decrypt(platformProvider.encryptedKey),
    provider: platformProvider.provider,
    providerId: platformProvider.id,
    modelName: platformProvider.modelName,
  };
}

async function checkAndDeductTokens(
  userId: string,
  estimatedTokens: number
): Promise<{ allowed: boolean; remaining: number }> {
  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  if (!subscription) {
    // No subscription = free tier with limited tokens
    return { allowed: true, remaining: 0 };
  }

  if (subscription.status !== "active") {
    return { allowed: false, remaining: 0 };
  }

  // If unlimited (tokensPerMonth is null on plan), always allow
  const plan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, subscription.planId))
    .limit(1);

  if (plan[0]?.tokensPerMonth === null) {
    return { allowed: true, remaining: Infinity };
  }

  const remaining = (subscription.tokensRemaining || 0) - estimatedTokens;

  if (remaining < 0) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}

async function recordTokenUsage(
  userId: string,
  providerId: string | undefined,
  tokensUsed: number,
  model: string,
  subscriptionId: string | undefined
) {
  // Record usage log
  await db.insert(tokenUsageLogs).values({
    userId,
    subscriptionId,
    providerId,
    tokensUsed,
    model,
    requestType: "generate",
  });

  // Update subscription tokens if applicable
  if (subscriptionId) {
    await db
      .update(userSubscriptions)
      .set({
        tokensUsed: sql`${userSubscriptions.tokensUsed} + ${tokensUsed}`,
        tokensRemaining: sql`${userSubscriptions.tokensRemaining} - ${tokensUsed}`,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, subscriptionId));
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateContentSchema.parse(body);

    // Get user's style profile
    const [profile] = await db
      .select()
      .from(styleProfiles)
      .where(eq(styleProfiles.userId, session.user.id));

    if (!profile) {
      return NextResponse.json(
        { error: "No style profile found. Please analyze your writing style first." },
        { status: 400 }
      );
    }

    // Get provider info based on subscription and requested provider
    const providerInfo = await getProviderInfo(
      session.user.id,
      validatedData.providerId
    );

    if (!providerInfo) {
      return NextResponse.json(
        { error: "No valid API provider available. Please check your subscription or add an API key." },
        { status: 400 }
      );
    }

    // Check token allowance (estimate ~500 tokens for the request)
    const tokenCheck = await checkAndDeductTokens(session.user.id, 500);
    if (!tokenCheck.allowed) {
      return NextResponse.json(
        { error: "Token quota exceeded. Please upgrade your plan or wait for the next billing cycle." },
        { status: 403 }
      );
    }

    // Generate content
    const styleDNA = {
      tone: profile.toneAnalysis as any,
      structure: profile.structurePatterns as any,
      vocabulary: profile.vocabularyPrefs as any,
      quirks: profile.writingQuirks as any,
      rawAnalysis: profile.rawAnalysis || "",
    };

    const content = await generateWithAI(
      validatedData.topic,
      styleDNA,
      providerInfo.provider as AIProvider,
      providerInfo.apiKey
    );

    // Estimate tokens used (rough estimation: ~4 chars per token)
    const estimatedTokens = Math.ceil(content.length / 4);

    // Get subscription for recording
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, session.user.id))
      .limit(1);

    // Record token usage (only for platform providers)
    if (providerInfo.type === "platform") {
      await recordTokenUsage(
        session.user.id,
        providerInfo.providerId,
        estimatedTokens,
        providerInfo.provider,
        subscription?.id
      );
    }

    // Save generated content
    const [savedContent] = await db
      .insert(generatedContent)
      .values({
        userId: session.user.id,
        styleProfileId: profile.id,
        topic: validatedData.topic,
        content,
        modelUsed: providerInfo.modelName || providerInfo.provider,
      })
      .returning();

    return NextResponse.json({
      content: savedContent,
      tokensUsed: estimatedTokens,
      providerType: providerInfo.type,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}

// Streaming endpoint for real-time generation
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateContentSchema.parse(body);

    // Get user's style profile
    const [profile] = await db
      .select()
      .from(styleProfiles)
      .where(eq(styleProfiles.userId, session.user.id));

    if (!profile) {
      return NextResponse.json(
        { error: "No style profile found. Please analyze your writing style first." },
        { status: 400 }
      );
    }

    // Get provider info
    const providerInfo = await getProviderInfo(
      session.user.id,
      validatedData.providerId
    );

    if (!providerInfo) {
      return NextResponse.json(
        { error: "No valid API provider available." },
        { status: 400 }
      );
    }

    // Check token allowance
    const tokenCheck = await checkAndDeductTokens(session.user.id, 500);
    if (!tokenCheck.allowed) {
      return NextResponse.json(
        { error: "Token quota exceeded." },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    const styleDNA = {
      tone: profile.toneAnalysis as any,
      structure: profile.structurePatterns as any,
      vocabulary: profile.vocabularyPrefs as any,
      quirks: profile.writingQuirks as any,
      rawAnalysis: profile.rawAnalysis || "",
    };

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullContent = "";

        try {
          for await (const chunk of streamGenerateContent(
            validatedData.topic,
            styleDNA,
            providerInfo.provider as AIProvider,
            providerInfo.apiKey
          )) {
            fullContent += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }

          // Estimate tokens used
          const estimatedTokens = Math.ceil(fullContent.length / 4);

          // Save the complete content
          await db.insert(generatedContent).values({
            userId,
            styleProfileId: profile.id,
            topic: validatedData.topic,
            content: fullContent,
            modelUsed: providerInfo.modelName || providerInfo.provider,
          });

          // Record token usage for platform providers
          if (providerInfo.type === "platform") {
            const [subscription] = await db
              .select()
              .from(userSubscriptions)
              .where(eq(userSubscriptions.userId, userId))
              .limit(1);

            await recordTokenUsage(
              userId,
              providerInfo.providerId,
              estimatedTokens,
              providerInfo.provider,
              subscription?.id
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, tokensUsed: estimatedTokens })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in streaming generation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
