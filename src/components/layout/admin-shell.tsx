import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

type AdminShellProps = {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  actionHref,
  actionLabel,
  children,
}: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900">
      <AdminSidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          title={title}
          actionHref={actionHref}
          actionLabel={actionLabel}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
