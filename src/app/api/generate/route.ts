import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, styleProfiles, generatedContent, userApiKeys } from "@/lib/db";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { generateContent as generateWithAI, streamGenerateContent } from "@/lib/ai/content-generator";
import { generateContentSchema } from "@/types";

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

    // Get user's API key
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

    const apiKey = decrypt(apiKeyRecord.encryptedKey);
    const provider = validatedData.provider || apiKeyRecord.provider;

    // Generate content
    const styleDNA = {
      tone: profile.toneAnalysis as any,
      structure: profile.structurePatterns as any,
      vocabulary: profile.vocabularyPrefs as any,
      quirks: profile.writingQuirks as any,
      rawAnalysis: profile.rawAnalysis || "",
    };

    const content = await generateWithAI(validatedData.topic, styleDNA, provider, apiKey);

    // Save generated content
    const [savedContent] = await db
      .insert(generatedContent)
      .values({
        userId: session.user.id,
        styleProfileId: profile.id,
        topic: validatedData.topic,
        content,
        modelUsed: provider,
      })
      .returning();

    return NextResponse.json({ content: savedContent });
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

    // Get user's API key
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

    const apiKey = decrypt(apiKeyRecord.encryptedKey);
    const provider = validatedData.provider || apiKeyRecord.provider;
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
            provider,
            apiKey
          )) {
            fullContent += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }

          // Save the complete content
          await db.insert(generatedContent).values({
            userId,
            styleProfileId: profile.id,
            topic: validatedData.topic,
            content: fullContent,
            modelUsed: provider,
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
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
