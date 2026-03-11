import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, globalProviders, adminLogs } from "@/lib/db";
import { count, eq, desc } from "drizzle-orm";

// Mask API key for display (show only last 4 characters)
function maskApiKey(key: string): string {
  if (key.length <= 4) return "****";
  return `****${key.slice(-4)}`;
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

    // Create provider (TODO: encrypt API key in production)
    const [newProvider] = await db
      .insert(globalProviders)
      .values({
        provider,
        name,
        encryptedKey: apiKey, // TODO: Encrypt in production
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
