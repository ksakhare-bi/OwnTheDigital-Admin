import Link from "next/link";
import { Plus } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AdminHeader({
  title,
  actionHref,
  actionLabel,
}: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4.5">
      <h1 className="text-xl font-bold text-zinc-800 tracking-tight">{title}</h1>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="size-4" />
          <span>{actionLabel}</span>
        </Link>
      ) : null}
    </header>
  );
}
