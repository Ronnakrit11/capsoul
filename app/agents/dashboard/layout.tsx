import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Dashboard | Capsoul COFFEE",
  description: "Agent dashboard for Capsoul COFFEE",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}