import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, userApiKeys } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";
import { apiKeySchema } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await db
      .select({
        id: userApiKeys.id,
        provider: userApiKeys.provider,
        createdAt: userApiKeys.createdAt,
      })
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, session.user.id));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
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

    const body = await request.json();
    const validatedData = apiKeySchema.parse(body);

    const encryptedKey = encrypt(validatedData.key);

    // Check if key for this provider already exists
    const existingKey = await db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.userId, session.user.id),
          eq(userApiKeys.provider, validatedData.provider)
        )
      );

    let savedKey;
    if (existingKey.length > 0) {
      // Update existing key
      [savedKey] = await db
        .update(userApiKeys)
        .set({ encryptedKey })
        .where(eq(userApiKeys.id, existingKey[0].id))
        .returning({
          id: userApiKeys.id,
          provider: userApiKeys.provider,
          createdAt: userApiKeys.createdAt,
        });
    } else {
      // Create new key
      [savedKey] = await db
        .insert(userApiKeys)
        .values({
          userId: session.user.id,
          provider: validatedData.provider,
          encryptedKey,
        })
        .returning({
          id: userApiKeys.id,
          provider: userApiKeys.provider,
          createdAt: userApiKeys.createdAt,
        });
    }

    return NextResponse.json({ key: savedKey });
  } catch (error) {
    console.error("Error saving API key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    await db
      .delete(userApiKeys)
      .where(
        and(
          eq(userApiKeys.userId, session.user.id),
          eq(userApiKeys.provider, provider)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
