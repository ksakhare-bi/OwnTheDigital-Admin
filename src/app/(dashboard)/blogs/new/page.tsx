import { AdminShell } from "@/components/layout/admin-shell";
import { BlogForm } from "@/components/blogs/blog-form";
import { listBlogs } from "@/services/blogs.service";

export default async function NewBlogPage() {
  const blogs = await listBlogs();

  return (
    <AdminShell title="Create blog">
      <BlogForm availableBlogs={blogs} />
    </AdminShell>
  );
}

