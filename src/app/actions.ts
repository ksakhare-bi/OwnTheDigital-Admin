"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "@/services/auth.service";
import { createBlog, updateBlog, deleteBlog } from "@/services/blogs.service";
import { loginSchema } from "@/lib/validations/auth";
import { createBlogSchema, updateBlogSchema } from "@/lib/validations/blog";
import type { z } from "zod";

type ActionResult = { error?: string; success?: boolean; blogId?: string };

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "An unexpected error occurred";
}

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const user = await loginAdmin(result.data);
    if (!user) {
      return { error: "Invalid email or password" };
    }
  } catch (err: unknown) {
    return { error: getErrorMessage(err) };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/login");
}

export async function createBlogAction(
  data: z.input<typeof createBlogSchema>
): Promise<ActionResult> {
  const result = createBlogSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    const blog = await createBlog(result.data);
    revalidatePath("/blogs");
    revalidatePath("/dashboard");
    return { success: true, blogId: blog.id };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err) || "Failed to create blog" };
  }
}

export async function updateBlogAction(
  id: string,
  data: z.input<typeof updateBlogSchema>
): Promise<ActionResult> {
  const result = updateBlogSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    const blog = await updateBlog(id, result.data);
    if (!blog) {
      return { success: false, error: "Blog not found" };
    }
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${id}/edit`);
    revalidatePath("/dashboard");
    return { success: true, blogId: blog.id };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err) || "Failed to update blog" };
  }
}

export async function deleteBlogAction(id: string): Promise<ActionResult> {
  try {
    const success = await deleteBlog(id);
    if (!success) {
      return { success: false, error: "Blog not found" };
    }
    revalidatePath("/blogs");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err) || "Failed to delete blog" };
  }
}
