import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, characters, adminLogs, userCharacters } from "@/lib/db";
import { count, desc, sql, eq } from "drizzle-orm";

// GET /api/admin/characters - List characters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Build query
    const conditions = activeOnly ? sql`${characters.isActive} = true` : undefined;

    const charactersList = await db
      .select()
      .from(characters)
      .where(conditions)
      .orderBy(desc(characters.createdAt));

    // Get usage count for each character
    const charactersWithUsage = await Promise.all(
      charactersList.map(async (char) => {
        const [usageCount] = await db
          .select({ count: count() })
          .from(userCharacters)
          .where(eq(userCharacters.characterId, char.id));

        return {
          ...char,
          usageCount: usageCount.count,
        };
      })
    );

    return NextResponse.json({ characters: charactersWithUsage });
  } catch (error) {
    console.error("Admin characters list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

// POST /api/admin/characters - Create character
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, stylePrompt } = body;

    // Validate
    if (!name || !stylePrompt) {
      return NextResponse.json(
        { error: "Name and stylePrompt are required" },
        { status: 400 }
      );
    }

    const [newCharacter] = await db
      .insert(characters)
      .values({
        name,
        description: description || null,
        stylePrompt,
      })
      .returning();

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "character.create",
      targetType: "character",
      targetId: newCharacter.id,
      details: { name },
    });

    return NextResponse.json({ character: newCharacter });
  } catch (error) {
    console.error("Admin character create error:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
