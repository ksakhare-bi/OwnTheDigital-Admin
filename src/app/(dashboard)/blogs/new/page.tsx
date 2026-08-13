import { AdminShell } from "@/components/layout/admin-shell";
import { BlogForm } from "@/components/blogs/blog-form";

export default function NewBlogPage() {
  return (
    <AdminShell title="Create blog">
      <BlogForm />
    </AdminShell>
  );
}
