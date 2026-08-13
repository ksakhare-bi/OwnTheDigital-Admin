import { z } from "zod";

export const blogSectionSchema = z.object({
  heading: z.string().min(2, "Section heading must be at least 2 characters"),
  description: z.string().min(10, "Section description must be at least 10 characters"),
  bullets: z.array(z.string().trim()).optional(),
});

export const createBlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case slug"),
  category: z.string().min(2, "Category is required"),
  readTime: z.string().min(2, "Read Time is required"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  image: z.string().min(1, "Featured Image URL or path is required"),
  tags: z.array(z.string().trim()).min(1, "At least one tag is required"),
  intro: z.string().min(10, "Intro must be at least 10 characters"),
  sections: z.array(blogSectionSchema).min(1, "At least one section is required"),
  ctaTags: z.array(z.string().trim()).optional().default([]),
  published: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export type CreateBlogSchema = z.infer<typeof createBlogSchema>;
export type UpdateBlogSchema = z.infer<typeof updateBlogSchema>;
