import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/services/auth.service";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
