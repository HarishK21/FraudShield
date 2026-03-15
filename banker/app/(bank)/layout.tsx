import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUserFromServerCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BankLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromServerCookie();

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
