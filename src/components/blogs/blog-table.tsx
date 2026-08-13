import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format-date";
import type { Blog } from "@/types/blog";
import Link from "next/link";
import { Edit2, ExternalLink, Image as ImageIcon } from "lucide-react";

type BlogTableProps = {
  blogs: Blog[];
};

export function BlogTable({ blogs }: BlogTableProps) {
  if (blogs.length === 0) {
    return (
      <EmptyState
        title="No blogs yet"
        description="Create your first blog post to get started."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50/75 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-5 py-4 font-bold">Title & URL</th>
            <th className="px-5 py-4 font-bold">Status</th>
            <th className="px-5 py-4 font-bold">Category</th>
            <th className="px-5 py-4 font-bold">Last Updated</th>
            <th className="px-5 py-4 font-bold text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {blogs.map((blog) => (
            <tr key={blog.id} className="text-zinc-800 transition-colors hover:bg-zinc-50/40">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3.5">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt=""
                      className="h-10 w-14 rounded-lg object-cover bg-zinc-50 border border-zinc-200/60 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-14 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center shrink-0">
                      <ImageIcon className="size-5 text-zinc-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-900 truncate max-w-[320px]">{blog.title}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">/{blog.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                {blog.published ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100/60">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100/60">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Draft
                  </span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center rounded-md bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                  {blog.category}
                </span>
              </td>
              <td className="px-5 py-3.5 text-zinc-500 font-medium">
                {formatDate(blog.updatedAt)}
              </td>
              <td className="px-5 py-3.5 text-right pr-6">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/blogs/${blog.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.97] cursor-pointer"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </Link>
                  <a
                    href={`http://localhost:3000/blog/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center size-8 rounded-lg border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-700 hover:border-zinc-300 active:scale-[0.97] cursor-pointer"
                    title="View live website"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
