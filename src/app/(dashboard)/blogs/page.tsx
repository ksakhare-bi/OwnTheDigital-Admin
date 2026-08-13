import { BlogTable } from "@/components/blogs/blog-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { listBlogs } from "@/services/blogs.service";

export default async function BlogsPage() {
  const blogs = await listBlogs();

  return (
    <AdminShell
      title="Blogs"
      actionHref="/blogs/new"
      actionLabel="Create blog"
    >
      <BlogTable blogs={blogs} />
    </AdminShell>
  );
}
