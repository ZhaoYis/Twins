import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, styleProfiles, articles } from "@/lib/db";
import { eq, count } from "drizzle-orm";
import { analyzeStyle } from "@/lib/ai/style-analyzer";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(styleProfiles)
      .where(eq(styleProfiles.userId, session.user.id));

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching style profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch style profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(session.user.id, "styleProfile");
    if (!rl.allowed) return rateLimitResponse(rl);

    const { provider } = await request.json();

    // Fetch all user's articles
    const userArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.userId, session.user.id));

    if (userArticles.length === 0) {
      return NextResponse.json(
        { error: "No articles found. Please upload some articles first." },
        { status: 400 }
      );
    }

    // Get API key for the provider
    const { userApiKeys } = await import("@/lib/db");
    const [apiKeyRecord] = await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, session.user.id));

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: "No API key configured. Please add your API key in settings." },
        { status: 400 }
      );
    }

    // Decrypt API key
    const { decrypt } = await import("@/lib/encryption");
    const apiKey = decrypt(apiKeyRecord.encryptedKey);

    // Analyze style
    const combinedContent = userArticles.map((a) => a.content).join("\n\n---\n\n");
    const styleDNA = await analyzeStyle(combinedContent, provider || "openai", apiKey);

    // Get article count
    const [articleCountResult] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.userId, session.user.id));

    // Upsert style profile
    const existingProfile = await db
      .select()
      .from(styleProfiles)
      .where(eq(styleProfiles.userId, session.user.id));

    let profile;
    if (existingProfile.length > 0) {
      [profile] = await db
        .update(styleProfiles)
        .set({
          toneAnalysis: styleDNA.tone,
          structurePatterns: styleDNA.structure,
          vocabularyPrefs: styleDNA.vocabulary,
          writingQuirks: styleDNA.quirks,
          rawAnalysis: styleDNA.rawAnalysis,
          articleCount: articleCountResult.count,
          updatedAt: new Date(),
        })
        .where(eq(styleProfiles.userId, session.user.id))
        .returning();
    } else {
      [profile] = await db
        .insert(styleProfiles)
        .values({
          userId: session.user.id,
          toneAnalysis: styleDNA.tone,
          structurePatterns: styleDNA.structure,
          vocabularyPrefs: styleDNA.vocabulary,
          writingQuirks: styleDNA.quirks,
          rawAnalysis: styleDNA.rawAnalysis,
          articleCount: articleCountResult.count,
        })
        .returning();
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error creating style profile:", error);
    return NextResponse.json(
      { error: "Failed to create style profile" },
      { status: 500 }
    );
  }
}
