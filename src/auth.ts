import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Get admin emails from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function ensureAdminRole(userId: string, email: string) {
  const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
  if (isAdminEmail) {
    // Update user role to admin if email is in whitelist
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId));
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // Check if this is a new user and assign admin role if needed
        if (user.id && user.email) {
          await ensureAdminRole(user.id, user.email);
        }

        // Fetch role from database
        if (user.id) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
          });
          token.role = dbUser?.role || "user";
          token.status = dbUser?.status || "active";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
});

// Type augmentation for next-auth
declare module "next-auth" {
  interface User {
    role?: string;
    status?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      status: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    role?: string;
    status?: string;
  }
}
