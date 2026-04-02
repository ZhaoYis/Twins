import { auth } from "@/auth";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface VerifiedUser {
  id: string;
  email: string;
  role: string;
  status: string;
}

interface VerifyResult {
  user: VerifiedUser | null;
  error: NextResponse | null;
}

export async function verifyActiveUser(): Promise<VerifyResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser) {
    return {
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  if (dbUser.status !== "active") {
    return {
      user: null,
      error: NextResponse.json({ error: "Account is disabled" }, { status: 403 }),
    };
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status,
    },
    error: null,
  };
}

export async function verifyAdmin(): Promise<VerifyResult> {
  const result = await verifyActiveUser();
  if (result.error) return result;

  if (result.user!.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }),
    };
  }

  return result;
}
