import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { listBlogs } from "@/services/blogs.service";
import { getContactStats } from "@/services/contacts.service";
import { FileText, Inbox, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const blogs = await listBlogs();
  const contactStats = await getContactStats();

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((b) => b.published).length;
  const draftBlogs = totalBlogs - publishedBlogs;

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-8">
        {/* Contact Overview Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Inbox className="size-5 text-blue-600" />
              <span>Contact Messages</span>
            </h2>
            <Link
              href="/contacts"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              View All Messages <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Received</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">{contactStats.total}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-xs">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">New / Unread</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">{contactStats.newCount}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Read</p>
              <p className="mt-2 text-3xl font-bold text-zinc-700">{contactStats.readCount}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-xs">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Replied</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{contactStats.repliedCount}</p>
            </div>
          </div>
        </div>

        {/* Blogs Overview Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="size-5 text-blue-600" />
              <span>Blogs</span>
            </h2>
            <Link
              href="/blogs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Manage Blogs <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Blogs</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">{totalBlogs}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-xs">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Published</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{publishedBlogs}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 shadow-xs">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Drafts</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">{draftBlogs}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
