import type { ReactNode } from "react";

import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data-provider";

export default function DashboardLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <DashboardDataProvider>
      <DashboardAppShell>{children}</DashboardAppShell>
    </DashboardDataProvider>
  );
}
