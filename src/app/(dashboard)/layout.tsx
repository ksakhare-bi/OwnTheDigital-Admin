import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/services/auth.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return <>{children}</>;
}
