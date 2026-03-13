import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users, articles, generatedContent, userApiKeys, styleProfiles, roles, userRoles } from "@/lib/db";
import { count, sql, eq, or, like, desc } from "drizzle-orm";

// GET /api/admin/users - List users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const email = searchParams.get("email") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];
    if (email) {
      conditions.push(like(users.email, `%${email}%`));
    }
    if (role) {
      conditions.push(eq(users.role, role));
    }
    if (status) {
      conditions.push(eq(users.status, status));
    }

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(users)
      .where(conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined);

    // Get users with pagination
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined)
      .orderBy(sortOrder === "desc" ? desc(users.createdAt) : users.createdAt)
      .limit(limit)
      .offset(offset);

    // 为每个用户获取角色信息
    const usersWithRoles = await Promise.all(
      userList.map(async (user) => {
        const userRolesList = await db
          .select({ role: roles })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id));

        return {
          ...user,
          roles: userRolesList.map(ur => ur.role),
        };
      })
    );

    return NextResponse.json({
      users: usersWithRoles,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
