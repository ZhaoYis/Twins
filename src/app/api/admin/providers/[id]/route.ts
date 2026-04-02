import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, globalProviders, adminLogs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/encryption";

type Params = Promise<{ id: string }>;

function maskApiKey(encryptedKey: string): string {
  try {
    const plainKey = decrypt(encryptedKey);
    if (plainKey.length <= 4) return "****";
    return `****${plainKey.slice(-4)}`;
  } catch {
    return "****";
  }
}

// GET /api/admin/providers/:id - Provider details
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const provider = await db.query.globalProviders.findFirst({
      where: eq(globalProviders.id, id),
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    return NextResponse.json({
      provider: {
        ...provider,
        encryptedKey: maskApiKey(provider.encryptedKey),
      },
    });
  } catch (error) {
    console.error("Admin provider detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/providers/:id - Update provider
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, apiKey, isActive, rateLimit } = body;

    // Check provider exists
    const existing = await db.query.globalProviders.findFirst({
      where: eq(globalProviders.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (apiKey !== undefined) updateData.encryptedKey = encrypt(apiKey);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (rateLimit !== undefined) updateData.rateLimit = rateLimit;

    const [updated] = await db
      .update(globalProviders)
      .set(updateData)
      .where(eq(globalProviders.id, id))
      .returning();

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "provider.update",
      targetType: "provider",
      targetId: id,
      details: { name, isActive, rateLimit },
    });

    return NextResponse.json({
      provider: {
        ...updated,
        encryptedKey: maskApiKey(updated.encryptedKey),
      },
    });
  } catch (error) {
    console.error("Admin provider update error:", error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/providers/:id - Delete provider
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check provider exists
    const existing = await db.query.globalProviders.findFirst({
      where: eq(globalProviders.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    await db.delete(globalProviders).where(eq(globalProviders.id, id));

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "provider.delete",
      targetType: "provider",
      targetId: id,
      details: { name: existing.name, provider: existing.provider },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin provider delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete provider" },
      { status: 500 }
    );
  }
}
