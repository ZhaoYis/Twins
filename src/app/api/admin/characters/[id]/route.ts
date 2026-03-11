import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, characters, adminLogs, userCharacters } from "@/lib/db";
import { eq } from "drizzle-orm";

type Params = Promise<{ id: string }>;

// GET /api/admin/characters/:id - Character details
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const character = await db.query.characters.findFirst({
      where: eq(characters.id, id),
    });

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Admin character detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/characters/:id - Update character
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, stylePrompt, isActive } = body;

    // Check character exists
    const existing = await db.query.characters.findFirst({
      where: eq(characters.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (stylePrompt !== undefined) updateData.stylePrompt = stylePrompt;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db
      .update(characters)
      .set(updateData)
      .where(eq(characters.id, id))
      .returning();

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "character.update",
      targetType: "character",
      targetId: id,
      details: { name, isActive },
    });

    return NextResponse.json({ character: updated });
  } catch (error) {
    console.error("Admin character update error:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/characters/:id - Delete character
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check character exists
    const existing = await db.query.characters.findFirst({
      where: eq(characters.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Remove user assignments first
    await db.delete(userCharacters).where(eq(userCharacters.characterId, id));

    // Delete character
    await db.delete(characters).where(eq(characters.id, id));

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "character.delete",
      targetType: "character",
      targetId: id,
      details: { name: existing.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin character delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}
