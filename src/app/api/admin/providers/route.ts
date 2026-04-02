import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, globalProviders, adminLogs } from "@/lib/db";
import { count, eq, desc } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/encryption";

function maskApiKey(encryptedKey: string): string {
  try {
    const plainKey = decrypt(encryptedKey);
    if (plainKey.length <= 4) return "****";
    return `****${plainKey.slice(-4)}`;
  } catch {
    return "****";
  }
}

// GET /api/admin/providers - List providers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const providers = await db
      .select({
        id: globalProviders.id,
        provider: globalProviders.provider,
        name: globalProviders.name,
        isActive: globalProviders.isActive,
        rateLimit: globalProviders.rateLimit,
        createdAt: globalProviders.createdAt,
        updatedAt: globalProviders.updatedAt,
        encryptedKey: globalProviders.encryptedKey,
      })
      .from(globalProviders)
      .orderBy(desc(globalProviders.createdAt));

    // Mask API keys
    const maskedProviders = providers.map((p) => ({
      ...p,
      encryptedKey: maskApiKey(p.encryptedKey),
    }));

    return NextResponse.json({ providers: maskedProviders });
  } catch (error) {
    console.error("Admin providers list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/providers - Create provider
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { provider, name, apiKey, rateLimit } = body;

    // Validate
    if (!provider || !name || !apiKey) {
      return NextResponse.json(
        { error: "Provider, name, and apiKey are required" },
        { status: 400 }
      );
    }

    if (!["openai", "anthropic"].includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider. Must be 'openai' or 'anthropic'" },
        { status: 400 }
      );
    }

    const [newProvider] = await db
      .insert(globalProviders)
      .values({
        provider,
        name,
        encryptedKey: encrypt(apiKey),
        rateLimit: rateLimit || null,
      })
      .returning();

    // Log action
    await db.insert(adminLogs).values({
      adminId: session.user.id,
      action: "provider.create",
      targetType: "provider",
      targetId: newProvider.id,
      details: { provider, name },
    });

    return NextResponse.json({
      provider: {
        ...newProvider,
        encryptedKey: maskApiKey(newProvider.encryptedKey),
      },
    });
  } catch (error) {
    console.error("Admin provider create error:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}
