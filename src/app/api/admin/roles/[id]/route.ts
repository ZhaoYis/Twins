import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, roles, rolePermissions, users } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// PATCH /api/admin/roles/[id] - 更新角色
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { displayName, description, permissionIds } = body;

    // 更新角色信息
    const [updatedRole] = await db
      .update(roles)
      .set({ displayName, description, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();

    if (!updatedRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // 更新权限：先删除旧的，再添加新的
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

    if (permissionIds && permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((permId: string) => ({
          roleId: id,
          permissionId: permId,
        }))
      );
    }

    return NextResponse.json({ role: updatedRole });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roles/[id] - 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // 检查是否是系统角色
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json(
        { error: "Cannot delete system role" },
        { status: 400 }
      );
    }

    // 删除角色（关联的 rolePermissions 和 userRoles 会级联删除）
    await db.delete(roles).where(eq(roles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
