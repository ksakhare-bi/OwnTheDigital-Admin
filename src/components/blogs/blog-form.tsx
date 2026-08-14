"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Control, type UseFormRegister, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBlogSchema } from "@/lib/validations/blog";
import { createBlogAction, updateBlogAction, deleteBlogAction } from "@/app/actions";
import { slugify } from "@/utils/slug";
import type { Blog } from "@/types/blog";

type BlogFormProps = {
  blog?: Blog | null;
};

type BlogFormValues = z.input<typeof createBlogSchema>;

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      title: blog?.title || "",
      slug: blog?.slug || "",
      category: blog?.category || "SEO",
      readTime: blog?.readTime || "5 Mins",
      excerpt: blog?.excerpt || "",
      image: blog?.image || "/images/home/service-performance.png",
      tags: blog?.tags || ["Digital Marketing", "Strategy"],
      intro: blog?.intro || "",
      sections: blog?.sections || [
        {
          heading: "Introduction to the Topic",
          description: "Enter section details here.",
          bullets: [],
        },
      ],
      published: blog?.published || false,
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: "sections",
  });

  const titleValue = watch("title");
  const excerptValue = watch("excerpt");

  useEffect(() => {
    setValue("intro", excerptValue || "", { shouldValidate: true });
  }, [excerptValue, setValue]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    if (!blog) {
      setValue("slug", slugify(val));
    }
  };

  const handleGenerateSlug = () => {
    setValue("slug", slugify(titleValue));
  };

  const onSubmit = (data: BlogFormValues) => {
    setError(null);
    startTransition(async () => {
      let res;
      if (blog) {
        res = await updateBlogAction(blog.id, data);
      } else {
        res = await createBlogAction(data);
      }

      if (res.success) {
        router.push("/blogs");
      } else {
        setError(res.error || "Something went wrong");
      }
    });
  };

  const handleDelete = () => {
    if (!blog) return;
    if (!confirm("Are you sure you want to delete this blog?")) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteBlogAction(blog.id);
      if (res.success) {
        router.push("/blogs");
      } else {
        setError(res.error || "Failed to delete blog");
      }
    });
  };

  const [tagsInput, setTagsInput] = useState(blog?.tags.join(", ") || "Digital Marketing, Strategy");

  const handleTagsChange = (val: string) => {
    setTagsInput(val);
    const parsed = val.split(",").map((t) => t.trim()).filter(Boolean);
    setValue("tags", parsed);
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-bold border-b border-zinc-100 pb-2 text-zinc-800">
          Blog Details
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-zinc-700">
              Blog Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="e.g. 5 SEO Strategies for 2026"
              className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="block text-sm font-semibold text-zinc-700">
                Slug (URL Pathway)
              </label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Regenerate slug
              </button>
            </div>
            <input
              id="slug"
              type="text"
              {...register("slug")}
              placeholder="e.g. 5-seo-strategies-for-2026"
              className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-zinc-700">
              Category
            </label>
            <input
              id="category"
              type="text"
              {...register("category")}
              placeholder="SEO or Marketing"
              className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-zinc-700">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Digital Marketing, Strategy"
              className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.tags && (
              <p className="mt-1 text-xs text-red-600">{errors.tags.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="readTime" className="block text-sm font-semibold text-zinc-700">
              Read Time
            </label>
            <input
              id="readTime"
              type="text"
              {...register("readTime")}
              placeholder="5 Mins"
              className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.readTime && (
              <p className="mt-1 text-xs text-red-600">{errors.readTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-zinc-700">
              Featured Image URL
            </label>
            <input
              id="image"
              type="text"
              {...register("image")}
              placeholder="/images/home/service-performance.png"
              className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.image && (
              <p className="mt-1 text-xs text-red-600">{errors.image.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-semibold text-zinc-700">
            Excerpt / Intro Paragraph
          </label>
          <textarea
            id="excerpt"
            rows={3}
            {...register("excerpt")}
            placeholder="Brief summary shown on blog cards and at the top of the blog page..."
            className="mt-1.5 block w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          {errors.excerpt && (
            <p className="mt-1 text-xs text-red-600">{errors.excerpt.message}</p>
          )}
        </div>

        <div className="space-y-5 pt-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-base font-bold text-zinc-800">
              Content Sections
            </h3>
            <button
              type="button"
              onClick={() => appendSection({ heading: "", description: "", bullets: [] })}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100/80 transition-all cursor-pointer"
            >
              + Add Section
            </button>
          </div>

          {sectionFields.map((sectionField, sectionIndex) => (
            <div
              key={sectionField.id}
              className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4 relative shadow-sm"
            >
              <button
                type="button"
                onClick={() => removeSection(sectionIndex)}
                className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
              >
                Delete Section
              </button>

              <div className="max-w-[80%]">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Section #{sectionIndex + 1}
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Section Heading
                </label>
                <input
                  type="text"
                  {...register(`sections.${sectionIndex}.heading` as const)}
                  placeholder="e.g. 1. Technical SEO Strategy"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.sections?.[sectionIndex]?.heading && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.sections[sectionIndex].heading.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Section Description
                </label>
                <textarea
                  rows={3}
                  {...register(`sections.${sectionIndex}.description` as const)}
                  placeholder="Write section content details..."
                  className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                {errors.sections?.[sectionIndex]?.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.sections[sectionIndex].description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-zinc-200/50 pt-4">
                <label className="block text-sm font-semibold text-zinc-700">
                  Key Bullet Points (Optional)
                </label>
                <BulletListEditor
                  control={control}
                  sectionIndex={sectionIndex}
                  register={register}
                />
              </div>
            </div>
          ))}

          {errors.sections && !Array.isArray(errors.sections) && (
            <p className="mt-1 text-xs text-red-600">{(errors.sections as FieldError).message}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-3">
          <input
            id="published"
            type="checkbox"
            {...register("published")}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="published" className="text-sm font-semibold text-zinc-700 cursor-pointer">
            Publish immediately (visible on the main site)
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-150 pt-6 sm:flex-row sm:justify-between">
          <div>
            {blog && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100/80 transition-all disabled:bg-zinc-100 disabled:text-zinc-400 sm:w-auto active:scale-[0.98] cursor-pointer"
              >
                Delete Blog
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all disabled:bg-zinc-400 active:scale-[0.98] cursor-pointer"
            >
              {isPending
                ? "Saving..."
                : blog
                  ? "Update Blog"
                  : "Create Blog"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function BulletListEditor({
  control,
  sectionIndex,
  register,
}: {
  control: Control<BlogFormValues>;
  sectionIndex: number;
  register: UseFormRegister<BlogFormValues>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bulletsControl = control as unknown as Control<Record<string, any>>;

  const { fields, append, remove } = useFieldArray({
    control: bulletsControl,
    name: `sections.${sectionIndex}.bullets`,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, bulletIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
          <input
            type="text"
            {...register(`sections.${sectionIndex}.bullets.${bulletIndex}` as const)}
            placeholder={`Bullet #${bulletIndex + 1}`}
            className="block flex-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => remove(bulletIndex)}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append("")}
        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
      >
        + Add Bullet Point
      </button>
    </div>
  );
}
