"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/blogs", label: "Blogs", icon: FileText },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-5 text-center">
        <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          Own The Digital
        </p>
        <p className="text-base font-bold text-zinc-800 tracking-tight mt-0.5">Admin Portal</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50/70 text-blue-600 shadow-sm border border-blue-100/50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
            >
              <Icon className={`size-4 ${isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            <LogOut className="size-4 text-red-500" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
