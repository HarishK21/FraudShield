import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getUserFromServerCookie } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getUserFromServerCookie();

  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
