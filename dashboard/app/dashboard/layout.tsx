// QueryClientProvider is now in the root layout (app/providers.tsx).
// This layout is kept for future dashboard-specific providers.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
