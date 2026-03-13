import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, roles, permissions, rolePermissions, userRoles, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/roles - 获取所有角色
export async function GET() {
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

    // 获取所有角色
    const allRoles = await db.select().from(roles);

    // 为每个角色获取权限
    const rolesWithPermissions = await Promise.all(
      allRoles.map(async (role) => {
        const rolePerms = await db
          .select({ permission: permissions })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(eq(rolePermissions.roleId, role.id));

        return {
          ...role,
          permissions: rolePerms.map(rp => rp.permission),
        };
      })
    );

    return NextResponse.json({ roles: rolesWithPermissions });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST /api/admin/roles - 创建新角色
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, displayName, description, permissionIds } = body;

    // 创建角色
    const [newRole] = await db
      .insert(roles)
      .values({ name, displayName, description })
      .returning();

    // 分配权限
    if (permissionIds && permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((permId: string) => ({
          roleId: newRole.id,
          permissionId: permId,
        }))
      );
    }

    return NextResponse.json({ role: newRole }, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
