import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { BlogForm } from "@/components/blogs/blog-form";
import { getBlogById, listBlogs } from "@/services/blogs.service";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const [blog, allBlogs] = await Promise.all([
    getBlogById(id),
    listBlogs(),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <AdminShell title="Edit blog">
      <BlogForm blog={blog} availableBlogs={allBlogs} />
    </AdminShell>
  );
}

