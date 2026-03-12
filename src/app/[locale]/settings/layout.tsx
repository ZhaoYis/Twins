// Force dynamic rendering for settings routes that require authentication
export const dynamic = 'force-dynamic';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
