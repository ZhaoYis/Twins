import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { setRequestLocale } from "next-intl/server";

// Force dynamic rendering for admin routes that require authentication
export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  // Middleware should handle this, but double-check
  if (!session || session.user.role !== "admin") {
    redirect(`/${locale}/auth/signin`);
  }

  return <AdminLayout>{children}</AdminLayout>;
}
