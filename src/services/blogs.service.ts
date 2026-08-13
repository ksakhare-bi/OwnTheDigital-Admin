import { connectToDatabase } from "@/lib/db";
import { BlogModel } from "@/models/blog.model";
import type { Blog, CreateBlogInput, UpdateBlogInput } from "@/types/blog";

type DbBlogDoc = {
  _id: { toString(): string };
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
  tags?: string[];
  intro: string;
  sections?: { heading: string; description: string; bullets?: string[] }[];
  ctaTags?: string[];
  published: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapBlog(doc: DbBlogDoc): Blog {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    readTime: doc.readTime,
    excerpt: doc.excerpt,
    image: doc.image,
    tags: doc.tags || [],
    intro: doc.intro,
    sections: doc.sections || [],
    ctaTags: doc.ctaTags || [],
    published: doc.published,
    publishedAt: doc.publishedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listBlogs(): Promise<Blog[]> {
  await connectToDatabase();
  const blogs = await BlogModel.find().sort({ updatedAt: -1 }).lean();
  return (blogs as unknown as DbBlogDoc[]).map(mapBlog);
}

export async function getBlogById(id: string): Promise<Blog | null> {
  await connectToDatabase();
  const blog = await BlogModel.findById(id).lean();
  return blog ? mapBlog(blog as unknown as DbBlogDoc) : null;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  await connectToDatabase();
  const blog = await BlogModel.findOne({ slug }).lean();
  return blog ? mapBlog(blog as unknown as DbBlogDoc) : null;
}

export async function createBlog(input: CreateBlogInput): Promise<Blog> {
  await connectToDatabase();

  const published = Boolean(input.published);
  const blog = await BlogModel.create({
    ...input,
    published,
    publishedAt: published ? new Date() : null,
  });

  return mapBlog(blog as unknown as DbBlogDoc);
}

export async function updateBlog(
  id: string,
  input: UpdateBlogInput,
): Promise<Blog | null> {
  await connectToDatabase();

  const existing = await BlogModel.findById(id);
  if (!existing) {
    return null;
  }

  const nextPublished =
    typeof input.published === "boolean" ? input.published : existing.published;

  existing.set({
    ...input,
    published: nextPublished,
    publishedAt: nextPublished
      ? (existing.publishedAt ?? new Date())
      : null,
  });

  await existing.save();
  return mapBlog(existing as unknown as DbBlogDoc);
}

export async function deleteBlog(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await BlogModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function setBlogPublished(
  id: string,
  published: boolean,
): Promise<Blog | null> {
  return updateBlog(id, {
    published,
    publishedAt: published ? new Date() : null,
  });
}
