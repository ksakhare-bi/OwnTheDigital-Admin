export type BlogAuthor = {
  name: string;
  avatar?: string;
  role?: string;
};

export type FeaturedImage = {
  url: string;
  name?: string;
  altText: string;
  title?: string;
  caption?: string;
  description?: string;
};

export type BlogSeo = {
  title: string;
  description: string;
  focusKeyword?: string;
  keywords?: string[];
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  schemaType?: string;
};

export type BlogSocial = {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: "summary_large_image" | "summary";
};

export type RelatedBlogItem = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: string;
};

export type BlogSchemaSettings = {
  type?: string;
  headline?: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  image?: string;
};

export type EmbeddedLink = {
  url: string;
  title: string;
  description?: string;
  category?: string;
};

export type BlogSection = {
  heading: string;
  description: string;
  bullets?: string[];
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  author: string | BlogAuthor;
  image: string;
  featuredImage?: FeaturedImage;
  tags: string[];
  content?: string;
  contentMode?: "visual" | "markdown" | "html";
  intro?: string;
  sections?: BlogSection[];
  ctaTags?: string[];
  status?: "draft" | "published";
  published: boolean;
  publishedAt?: Date | null;
  seo?: BlogSeo;
  social?: BlogSocial;
  relatedBlogs?: RelatedBlogItem[];
  embeddedLinks?: EmbeddedLink[];
  schemaSettings?: BlogSchemaSettings;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBlogInput = {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  author?: string | BlogAuthor;
  image: string;
  featuredImage?: FeaturedImage;
  tags: string[];
  content?: string;
  contentMode?: "visual" | "markdown" | "html";
  intro?: string;
  sections?: BlogSection[];
  ctaTags?: string[];
  status?: "draft" | "published";
  published?: boolean;
  publishedAt?: Date | string | null;
  seo?: BlogSeo;
  social?: BlogSocial;
  relatedBlogs?: RelatedBlogItem[];
  embeddedLinks?: EmbeddedLink[];
  schemaSettings?: BlogSchemaSettings;
};

export type UpdateBlogInput = Partial<CreateBlogInput> & {
  publishedAt?: Date | string | null;
};

