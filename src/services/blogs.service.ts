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
  author?: unknown;
  image: string;
  featuredImage?: {
    url: string;
    name?: string;
    altText: string;
    title?: string;
    caption?: string;
    description?: string;
  };
  tags?: string[];
  content?: string;
  contentMode?: "visual" | "markdown" | "html";
  intro?: string;
  sections?: { heading: string; description: string; bullets?: string[] }[];
  ctaTags?: string[];
  status?: "draft" | "published";
  published: boolean;
  publishedAt?: Date | null;
  seo?: {
    title: string;
    description: string;
    focusKeyword?: string;
    keywords?: string[];
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    schemaType?: string;
  };
  social?: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterCard?: "summary_large_image" | "summary";
  };
  relatedBlogs?: {
    id?: string;
    title: string;
    slug: string;
    excerpt?: string;
    image?: string;
    category?: string;
  }[];
  embeddedLinks?: {
    url: string;
    title: string;
    description?: string;
    category?: string;
  }[];
  schemaSettings?: {
    type?: string;
    headline?: string;
    description?: string;
    author?: string;
    publishedDate?: string;
    modifiedDate?: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

function mapBlog(doc: DbBlogDoc): Blog {
  const rawAuthor = doc.author || "Own The Digital Team";
  const authorValue =
    typeof rawAuthor === "string" && rawAuthor.toLowerCase().includes("brain inventory")
      ? "Own The Digital Team"
      : rawAuthor;
  const featImg = doc.featuredImage?.url
    ? doc.featuredImage
    : {
        url: doc.image || "",
        altText: doc.title || "Blog featured image",
        name: "",
        title: doc.title || "",
        caption: "",
        description: doc.excerpt || "",
      };

  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    readTime: doc.readTime || "5 Mins",
    excerpt: doc.excerpt,
    author: authorValue as Blog["author"],
    image: doc.image || featImg.url,
    featuredImage: featImg,
    tags: doc.tags || [],
    content: doc.content || "",
    contentMode: doc.contentMode || "visual",
    intro: doc.intro || doc.excerpt,
    sections: doc.sections || [],
    ctaTags: doc.ctaTags || [],
    status: doc.status || (doc.published ? "published" : "draft"),
    published: Boolean(doc.published),
    publishedAt: doc.publishedAt ?? null,
    seo: doc.seo || {
      title: doc.title,
      description: doc.excerpt,
      focusKeyword: "",
      keywords: doc.tags || [],
      canonicalUrl: `https://ownthedigital.com/blogs/${doc.slug}`,
      robotsIndex: true,
      robotsFollow: true,
      schemaType: "BlogPosting",
    },
    social: doc.social || {
      ogTitle: doc.title,
      ogDescription: doc.excerpt,
      ogImage: doc.image || featImg.url,
      ogUrl: `https://ownthedigital.com/blogs/${doc.slug}`,
      twitterTitle: doc.title,
      twitterDescription: doc.excerpt,
      twitterImage: doc.image || featImg.url,
      twitterCard: "summary_large_image",
    },
    relatedBlogs: (doc.relatedBlogs || []).map((rb) => ({
      id: rb.id ? String(rb.id) : undefined,
      title: String(rb.title || ""),
      slug: String(rb.slug || ""),
      excerpt: rb.excerpt ? String(rb.excerpt) : "",
      image: rb.image ? String(rb.image) : "",
      category: rb.category ? String(rb.category) : "",
    })),
    embeddedLinks: (doc.embeddedLinks || []).map((el) => ({
      url: String(el.url || ""),
      title: String(el.title || ""),
      description: el.description ? String(el.description) : "",
      category: el.category ? String(el.category) : "Resource",
    })),
    schemaSettings: doc.schemaSettings || {
      type: "BlogPosting",
      headline: doc.title,
      description: doc.excerpt,
      author: typeof authorValue === "string" ? authorValue : "Own The Digital Team",
      publishedDate: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : "",
      modifiedDate: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
      image: doc.image || featImg.url,
    },

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listBlogs(): Promise<Blog[]> {
  await connectToDatabase();
  const blogs = await BlogModel.find().sort({ updatedAt: -1 }).lean();
  return (blogs as unknown as DbBlogDoc[]).map(mapBlog);
}

export async function listPublishedBlogs(filters?: {
  category?: string;
  tag?: string;
}): Promise<Blog[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = {
    $or: [{ published: true }, { status: "published" }],
  };
  if (filters?.category) {
    query.category = { $regex: new RegExp(`^${filters.category}$`, "i") };
  }
  if (filters?.tag) {
    query.tags = { $in: [new RegExp(`^${filters.tag}$`, "i")] };
  }
  const blogs = await BlogModel.find(query).sort({ publishedAt: -1, createdAt: -1 }).lean();
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

export async function getPublishedBlogBySlug(slug: string): Promise<Blog | null> {
  await connectToDatabase();
  const blog = await BlogModel.findOne({
    slug,
    $or: [{ published: true }, { status: "published" }],
  }).lean();
  return blog ? mapBlog(blog as unknown as DbBlogDoc) : null;
}

export async function createBlog(input: CreateBlogInput): Promise<Blog> {
  await connectToDatabase();

  const isPublished = input.status === "published" || Boolean(input.published);
  const finalImage = input.featuredImage?.url || input.image;

  const blog = await BlogModel.create({
    ...input,
    image: finalImage,
    featuredImage: input.featuredImage || {
      url: finalImage,
      altText: input.title,
    },
    status: isPublished ? "published" : "draft",
    published: isPublished,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : isPublished ? new Date() : null,
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
    input.status !== undefined
      ? input.status === "published"
      : typeof input.published === "boolean"
        ? input.published
        : existing.published;

  const finalImage = input.featuredImage?.url || input.image || existing.image;

  existing.set({
    ...input,
    image: finalImage,
    featuredImage: input.featuredImage || existing.featuredImage || {
      url: finalImage,
      altText: input.title || existing.title,
    },
    status: nextPublished ? "published" : "draft",
    published: nextPublished,
    publishedAt: input.publishedAt !== undefined
      ? (input.publishedAt ? new Date(input.publishedAt) : null)
      : nextPublished
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
    status: published ? "published" : "draft",
    published,
    publishedAt: published ? new Date() : null,
  });
}

