import { AdminShell } from "@/components/layout/admin-shell";
import { listBlogs } from "@/services/blogs.service";

export default async function DashboardPage() {
  const blogs = await listBlogs();
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((b) => b.published).length;
  const draftBlogs = totalBlogs - publishedBlogs;

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Total blogs</p>
          <p className="mt-2 text-3xl font-semibold">{totalBlogs}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Published</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{publishedBlogs}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Drafts</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{draftBlogs}</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        CMS starter for Own the Digital. Blog CRUD, auth sessions, and database connections are now fully functional.
      </p>
    </AdminShell>
  );
}
