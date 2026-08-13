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
      required: true,
      trim: true,
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
