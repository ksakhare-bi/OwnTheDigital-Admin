import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { BlogForm } from "@/components/blogs/blog-form";
import { getBlogById } from "@/services/blogs.service";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    notFound();
  }

  return (
    <AdminShell title="Edit blog">
      <BlogForm blog={blog} />
    </AdminShell>
  );
}
