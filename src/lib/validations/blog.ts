import { z } from "zod";

export const blogSectionSchema = z.object({
  heading: z.string().min(2, "Section heading must be at least 2 characters"),
  description: z.string().min(10, "Section description must be at least 10 characters"),
  bullets: z.array(z.string().trim()).optional(),
});

export const featuredImageSchema = z.object({
  url: z.string().min(1, "Featured Image URL is required"),
  name: z.string().optional().default(""),
  altText: z.string().min(2, "Alt Text is required for SEO & accessibility"),
  title: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export const seoSettingsSchema = z.object({
  title: z.string().min(3, "SEO Title must be at least 3 characters"),
  description: z.string().min(10, "Meta Description must be at least 10 characters"),
  focusKeyword: z.string().optional().default(""),
  keywords: z.array(z.string().trim()).optional().default([]),
  canonicalUrl: z.string().optional().default(""),
  robotsIndex: z.boolean().optional().default(true),
  robotsFollow: z.boolean().optional().default(true),
  schemaType: z.string().optional().default("BlogPosting"),
});

export const socialSettingsSchema = z.object({
  ogTitle: z.string().optional().default(""),
  ogDescription: z.string().optional().default(""),
  ogImage: z.string().optional().default(""),
  ogUrl: z.string().optional().default(""),
  twitterTitle: z.string().optional().default(""),
  twitterDescription: z.string().optional().default(""),
  twitterImage: z.string().optional().default(""),
  twitterCard: z.enum(["summary_large_image", "summary"]).optional().default("summary_large_image"),
});

export const relatedBlogSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  excerpt: z.string().optional().default(""),
  image: z.string().optional().default(""),
  category: z.string().optional().default(""),
});

export const schemaSettingsSchema = z.object({
  type: z.string().optional().default("BlogPosting"),
  headline: z.string().optional().default(""),
  description: z.string().optional().default(""),
  author: z.string().optional().default(""),
  publishedDate: z.string().optional().default(""),
  modifiedDate: z.string().optional().default(""),
  image: z.string().optional().default(""),
});

export const createBlogSchema = z.object({
  // Basic Information
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case slug (e.g. how-to-choose-ai-model)"),
  excerpt: z.string().min(10, "Short Description / Excerpt must be at least 10 characters"),
  author: z.union([
    z.string().min(2, "Author name is required"),
    z.object({
      name: z.string().min(2, "Author name is required"),
      avatar: z.string().optional(),
      role: z.string().optional(),
    }),
  ]).default("Own The Digital Team"),

  category: z.string().min(2, "Category is required"),
  tags: z.array(z.string().trim()).min(1, "At least one tag is required"),
  status: z.enum(["draft", "published"]).default("draft"),
  published: z.boolean().optional().default(false),
  publishedAt: z.union([z.string(), z.date()]).nullable().optional(),
  readTime: z.string().min(1, "Read Time is required").default("5 Mins"),

  // Featured Image
  image: z.string().min(1, "Featured Image URL is required"),
  featuredImage: featuredImageSchema.optional(),

  // Content
  content: z.string().optional().default(""),
  contentMode: z.enum(["visual", "markdown", "html"]).optional().default("visual"),
  intro: z.string().optional().default(""),
  sections: z.array(blogSectionSchema).optional().default([]),
  ctaTags: z.array(z.string().trim()).optional().default([]),

  // SEO & Social
  seo: seoSettingsSchema.optional(),
  social: socialSettingsSchema.optional(),
  relatedBlogs: z.array(relatedBlogSchema).optional().default([]),
  schemaSettings: schemaSettingsSchema.optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export type CreateBlogSchema = z.infer<typeof createBlogSchema>;
export type UpdateBlogSchema = z.infer<typeof updateBlogSchema>;

