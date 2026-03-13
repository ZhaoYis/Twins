import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, permissions, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/permissions - 获取所有权限
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allPermissions = await db.select().from(permissions);

    return NextResponse.json({ permissions: allPermissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
