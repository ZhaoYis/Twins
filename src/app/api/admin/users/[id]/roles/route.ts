import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users, roles, userRoles } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/users/[id]/roles - 获取用户的角色
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查是否是管理员
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // 获取用户的角色
    const userRolesList = await db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, id));

    return NextResponse.json({ roles: userRolesList.map(ur => ur.role) });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id]/roles - 更新用户的角色
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查是否是管理员
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { roleIds } = body;

    if (!Array.isArray(roleIds)) {
      return NextResponse.json({ error: "Invalid roleIds" }, { status: 400 });
    }

    // 删除用户现有的所有角色
    await db.delete(userRoles).where(eq(userRoles.userId, id));

    // 添加新的角色
    if (roleIds.length > 0) {
      await db.insert(userRoles).values(
        roleIds.map(roleId => ({
          userId: id,
          roleId,
          assignedBy: session.user.id,
        }))
      );
    }

    // 检查是否包含超级管理员角色
    const adminRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'));

    const hasAdminRole = adminRoles.length > 0 && roleIds.includes(adminRoles[0].id);

    // 更新用户的 role 字段
    await db
      .update(users)
      .set({ role: hasAdminRole ? 'admin' : 'user' })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { error: "Failed to update user roles" },
      { status: 500 }
    );
  }
}
