import { Schema, models, model, type InferSchemaType } from "mongoose";

const sectionSchema = new Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    bullets: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false },
);

const relatedBlogItemSchema = new Schema(
  {
    id: { type: String },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    excerpt: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
  },
  { _id: false },
);

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    readTime: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    intro: {
      type: String,
      default: "",
      trim: true,
    },
    author: {
      type: Schema.Types.Mixed,
      default: "Own The Digital Team",
    },
    content: {
      type: String,
      default: "",
    },
    contentMode: {
      type: String,
      enum: ["visual", "markdown", "html"],
      default: "visual",
    },
    featuredImage: {
      url: { type: String, default: "" },
      name: { type: String, default: "" },
      altText: { type: String, default: "" },
      title: { type: String, default: "" },
      caption: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      focusKeyword: { type: String, default: "" },
      keywords: [{ type: String, trim: true }],
      canonicalUrl: { type: String, default: "" },
      robotsIndex: { type: Boolean, default: true },
      robotsFollow: { type: Boolean, default: true },
      schemaType: { type: String, default: "BlogPosting" },
    },
    social: {
      ogTitle: { type: String, default: "" },
      ogDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      ogUrl: { type: String, default: "" },
      twitterTitle: { type: String, default: "" },
      twitterDescription: { type: String, default: "" },
      twitterImage: { type: String, default: "" },
      twitterCard: { type: String, default: "summary_large_image" },
    },
    relatedBlogs: [relatedBlogItemSchema],
    schemaSettings: {
      type: { type: String, default: "BlogPosting" },
      headline: { type: String, default: "" },
      description: { type: String, default: "" },
      author: { type: String, default: "" },
      publishedDate: { type: String, default: "" },
      modifiedDate: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    sections: [sectionSchema],
    ctaTags: [
      {
        type: String,
        trim: true,
      },
    ],
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type BlogDocument = InferSchemaType<typeof blogSchema> & {
  _id: Schema.Types.ObjectId;
};

export const BlogModel = models.Blog || model("Blog", blogSchema);
