"use client";

import { useTransition, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Globe,
  Search,
  Share2,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  Check,
  Calendar,
  User,
  SlidersHorizontal,
  FileText,
  Eye,
  Info,
  Upload,
  Loader2,
} from "lucide-react";

import { createBlogSchema } from "@/lib/validations/blog";
import { createBlogAction, updateBlogAction, deleteBlogAction } from "@/app/actions";
import { slugify } from "@/utils/slug";
import type { Blog, RelatedBlogItem } from "@/types/blog";
import { ContentEditor } from "./content-editor";
import { CollapsibleBox } from "@/components/ui/collapsible-box";
import { ProgressBar } from "@/components/ui/progress-bar";

type BlogFormProps = {
  blog?: Blog | null;
  availableBlogs?: Blog[];
};

type BlogFormValues = z.input<typeof createBlogSchema>;

export function BlogForm({ blog, availableBlogs = [] }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initial values setup
  const initialAuthor = typeof blog?.author === "string" ? blog.author : blog?.author?.name || "Own The Digital Team";
  const initialImage = blog?.featuredImage?.url || blog?.image || "https://ownthedigital.com/images/blogs/default-blog.jpg";
  const initialSlug = blog?.slug || "";
  const initialCanonical = blog?.seo?.canonicalUrl || (initialSlug ? `https://ownthedigital.com/blogs/${initialSlug}` : "https://ownthedigital.com/blogs/");


  // Collapsible panels state for vertical accordion layout
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    editor: true,
    yoastSeo: true,
    featuredImage: true,
    tags: true,
    excerpt: true,
    relatedBlogs: true,
    postAttributes: true,
    publish: true,
  });

  const togglePanel = (panelKey: string) => {
    setOpenPanels((prev) => ({ ...prev, [panelKey]: !prev[panelKey] }));
  };

  const toggleAllPanels = (expand: boolean) => {
    setOpenPanels({
      editor: expand,
      yoastSeo: expand,
      featuredImage: expand,
      tags: expand,
      excerpt: expand,
      relatedBlogs: expand,
      postAttributes: expand,
      publish: expand,
    });
  };

  // Yoast sub-tabs: SEO, Readability, Schema, Social
  const [yoastTab, setYoastTab] = useState<"seo" | "readability" | "schema" | "social">("seo");

  // Google preview view mode: Mobile vs Desktop
  const [googlePreviewMode, setGooglePreviewMode] = useState<"mobile" | "desktop">("desktop");

  // Inner Yoast accordions
  const [yoastInnerOpen, setYoastInnerOpen] = useState<Record<string, boolean>>({
    focusKeyphrase: true,
    searchAppearance: true,
    seoAnalysis: true,
    cornerstone: false,
    advanced: false,
  });

  const toggleYoastInner = (key: string) => {
    setYoastInnerOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      title: blog?.title || "",
      slug: initialSlug,
      category: blog?.category || "Artificial Intelligence",
      readTime: blog?.readTime || "5 Mins",
      excerpt: blog?.excerpt || "",
      author: initialAuthor,
      status: blog?.status || (blog?.published ? "published" : "draft"),
      published: blog?.published ?? false,
      publishedAt: blog?.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : "",
      image: initialImage,
      featuredImage: {
        url: initialImage,
        name: blog?.featuredImage?.name || "ai-model-selection.jpg",
        altText: blog?.featuredImage?.altText || blog?.title || "AI model selection guide",
        title: blog?.featuredImage?.title || blog?.title || "AI Model Selection Guide",
        caption: blog?.featuredImage?.caption || "Choosing the right AI model based on business requirements.",
        description: blog?.featuredImage?.description || "Illustration showing different AI models and their performance, cost, and use cases.",
      },
      tags: blog?.tags && blog.tags.length > 0 ? blog.tags : ["AI Models", "LLM", "RAG", "Small Language Models"],
      content: blog?.content || (blog?.sections && blog.sections.length > 0 ? blog.sections.map(s => `<h2>${s.heading}</h2><p>${s.description}</p>${s.bullets?.length ? `<ul>${s.bullets.map(b => `<li>${b}</li>`).join("")}</ul>` : ""}`).join("\n\n") : ""),
      contentMode: blog?.contentMode || "visual",
      seo: {
        title: blog?.seo?.title || blog?.title || "",
        description: blog?.seo?.description || blog?.excerpt || "",
        focusKeyword: blog?.seo?.focusKeyword || "AI models",
        keywords: blog?.seo?.keywords && blog.seo.keywords.length > 0 ? blog.seo.keywords : ["AI models", "LLM", "RAG"],
        canonicalUrl: initialCanonical,
        robotsIndex: blog?.seo?.robotsIndex ?? true,
        robotsFollow: blog?.seo?.robotsFollow ?? true,
        schemaType: blog?.seo?.schemaType || "BlogPosting",
      },
      social: {
        ogTitle: blog?.social?.ogTitle || blog?.seo?.title || blog?.title || "",
        ogDescription: blog?.social?.ogDescription || blog?.seo?.description || blog?.excerpt || "",
        ogImage: blog?.social?.ogImage || initialImage,
        ogUrl: blog?.social?.ogUrl || initialCanonical,
        twitterTitle: blog?.social?.twitterTitle || blog?.seo?.title || blog?.title || "",
        twitterDescription: blog?.social?.twitterDescription || blog?.seo?.description || blog?.excerpt || "",
        twitterImage: blog?.social?.twitterImage || initialImage,
        twitterCard: blog?.social?.twitterCard || "summary_large_image",
      },
      relatedBlogs: blog?.relatedBlogs || [],
      schemaSettings: {
        type: blog?.schemaSettings?.type || "BlogPosting",
        headline: blog?.schemaSettings?.headline || blog?.title || "",
        description: blog?.schemaSettings?.description || blog?.seo?.description || blog?.excerpt || "",
        author: blog?.schemaSettings?.author || initialAuthor,
        publishedDate: blog?.schemaSettings?.publishedDate || "",
        modifiedDate: blog?.schemaSettings?.modifiedDate || "",
        image: blog?.schemaSettings?.image || initialImage,
      },
    },
  });

  const titleValue = watch("title") || "";
  const slugValue = watch("slug") || "";
  const excerptValue = watch("excerpt") || "";
  const authorValue = watch("author") || "";
  const statusValue = watch("status") || "draft";
  const featuredImageUrl = watch("featuredImage.url") || "";
  const contentValue = watch("content") || "";
  const seoTitleValue = watch("seo.title") || "";
  const metaDescValue = watch("seo.description") || "";
  const focusKeywordValue = watch("seo.focusKeyword") || "";
  const canonicalUrlValue = watch("seo.canonicalUrl") || "";
  const tagsValue = watch("tags") || [];
  const seoKeywordsValue = watch("seo.keywords") || [];
  const relatedBlogsValue = watch("relatedBlogs") || [];
  const schemaTypeValue = watch("seo.schemaType") || "BlogPosting";

  const [newTagInput, setNewTagInput] = useState("");
  const [customRelatedTitle, setCustomRelatedTitle] = useState("");
  const [customRelatedSlug, setCustomRelatedSlug] = useState("");
  const [showJsonLdPreview, setShowJsonLdPreview] = useState(false);

  // Featured Image Upload State & Handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleImageFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, WEBP, GIF, SVG, AVIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      setValue("featuredImage.url", data.url, { shouldValidate: true });
      setValue("image", data.url, { shouldValidate: true });
      setValue("featuredImage.name", data.filename);
      clearErrors("featuredImage.url");
      clearErrors("image");

      // Auto-populate altText if not set or default
      const currentAlt = watch("featuredImage.altText");
      if (!currentAlt || currentAlt === "AI model selection guide") {
        const cleanName = data.originalName
          ? data.originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          : "";
        const fallbackAlt = titleValue ? `${titleValue} cover` : cleanName || "Featured image";
        setValue("featuredImage.altText", fallbackAlt, { shouldValidate: true });
        clearErrors("featuredImage.altText");
      }

      // Auto-populate title if not set
      const currentTitle = watch("featuredImage.title");
      if (!currentTitle || currentTitle === "AI Model Selection Guide") {
        setValue("featuredImage.title", titleValue || data.originalName?.replace(/\.[^/.]+$/, "") || "");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error uploading image";
      setUploadError(message);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFeaturedImage = () => {
    setValue("featuredImage.url", "", { shouldValidate: true });
    setValue("image", "", { shouldValidate: true });
    setValue("featuredImage.name", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Auto-slugify on title change for new blogs
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    if (!blog) {
      const generatedSlug = slugify(val);
      setValue("slug", generatedSlug);
      setValue("seo.canonicalUrl", `https://ownthedigital.com/blogs/${generatedSlug}`);
      if (!seoTitleValue || seoTitleValue === titleValue) {
        setValue("seo.title", `${val} - Own The Digital`);
      }
    }
  };

  const handleGenerateSlug = () => {
    const gen = slugify(titleValue || "blog-post");
    setValue("slug", gen);
    setValue("seo.canonicalUrl", `https://ownthedigital.com/blogs/${gen}`);
  };

  // Tag management
  const addTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tagsValue.includes(trimmed)) {
      setValue("tags", [...tagsValue, trimmed]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", tagsValue.filter((t) => t !== tagToRemove));
  };

  // Related blog management
  const addRelatedBlog = (item: RelatedBlogItem) => {
    if (!relatedBlogsValue.some((b) => b.slug === item.slug)) {
      setValue("relatedBlogs", [...relatedBlogsValue, item]);
    }
  };

  const removeRelatedBlog = (slugToRemove: string) => {
    setValue("relatedBlogs", relatedBlogsValue.filter((b) => b.slug !== slugToRemove));
  };

  const handleAddCustomRelated = () => {
    if (customRelatedTitle.trim() && customRelatedSlug.trim()) {
      addRelatedBlog({
        title: customRelatedTitle.trim(),
        slug: slugify(customRelatedSlug.trim()),
      });
      setCustomRelatedTitle("");
      setCustomRelatedSlug("");
    }
  };

  // Submit Handler
  const onSubmit = (data: BlogFormValues) => {
    setError(null);
    startTransition(async () => {
      const isPub = data.status === "published";
      const payload = {
        ...data,
        published: isPub,
        publishedAt: isPub ? (data.publishedAt || new Date()) : null,
        image: data.featuredImage?.url || data.image,
      };

      let res;
      if (blog) {
        res = await updateBlogAction(blog.id, payload);
      } else {
        res = await createBlogAction(payload);
      }

      if (res.success) {
        router.push("/blogs");
      } else {
        setError(res.error || "Something went wrong while saving the blog.");
      }
    });
  };

  const handleDelete = () => {
    if (!blog) return;
    if (!confirm("Are you sure you want to delete this blog post? This cannot be undone.")) return;

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

  // Real-time character counts
  const seoTitleCount = (seoTitleValue || titleValue).length;
  const metaDescCount = (metaDescValue || excerptValue).length;

  // SEO Analysis score simulation
  const hasFocusInTitle = focusKeywordValue && (seoTitleValue || titleValue).toLowerCase().includes(focusKeywordValue.toLowerCase());
  const hasFocusInDesc = focusKeywordValue && (metaDescValue || excerptValue).toLowerCase().includes(focusKeywordValue.toLowerCase());
  const isTitleGoodLength = seoTitleCount >= 40 && seoTitleCount <= 60;
  const isDescGoodLength = metaDescCount >= 120 && metaDescCount <= 160;
  const isSeoGood = isTitleGoodLength && isDescGoodLength && Boolean(focusKeywordValue);

  return (
    <div className="w-full space-y-6 pb-24">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-xs">
          <AlertCircle className="size-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Bar with Status, Analysis Pills, and Primary Actions (Zero overlap, normal document flow) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-zinc-200/90 bg-white p-4 shadow-xs mb-6 relative z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                statusValue === "published"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span className={`size-1.5 rounded-full ${statusValue === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {statusValue === "published" ? "Published" : "Draft"}
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="size-3.5" />
                Readability analysis: Good
              </span>
              <span className="text-zinc-300">|</span>
              <span className={`inline-flex items-center gap-1 font-medium ${isSeoGood ? "text-emerald-600" : "text-amber-600"}`}>
                <span className={`size-2 rounded-full ${isSeoGood ? "bg-emerald-500" : "bg-amber-500"}`} />
                SEO: {isSeoGood ? "Good" : "Needs improvement"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleAllPanels(true)}
            className="text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1 cursor-pointer"
            title="Expand all collapsible panels"
          >
            Expand all
          </button>
          <span className="text-zinc-300">/</span>
          <button
            type="button"
            onClick={() => toggleAllPanels(false)}
            className="text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1 cursor-pointer"
            title="Collapse all collapsible panels"
          >
            Collapse all
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("status", "draft");
              handleSubmit(onSubmit)();
            }}
            disabled={isPending}
            className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-2xs transition disabled:opacity-50"
          >
            Save draft
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("status", "published");
              handleSubmit(onSubmit)();
            }}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer transition disabled:opacity-50"
          >
            <Sparkles className="size-3.5" />
            <span>{isPending ? "Saving..." : blog ? "Update" : "Publish"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Two-Column Gutenberg/Yoast WordPress Layout */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* ========================================================
              LEFT MAIN COLUMN: Title, Content Editor, Yoast SEO
          ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Slug Header */}
            <div className="rounded-xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <input
                type="text"
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="Add title"
                className="w-full text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 placeholder-zinc-300 border-0 focus:outline-none focus:ring-0 p-0"
              />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}

              {/* Permalink bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 text-xs text-zinc-500 font-mono">
                <span className="font-sans font-semibold text-zinc-600">Permalink:</span>
                <span className="text-zinc-400">https://ownthedigital.com/blogs/</span>
                <input
                  type="text"
                  {...register("slug")}
                  className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-mono text-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="font-sans text-[11px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
              {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
            </div>

            {/* Content Editor Panel */}
            <CollapsibleBox
              title="Blog Content"
              isOpen={openPanels.editor}
              onToggle={() => togglePanel("editor")}
              badge={
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Visual / Markdown / HTML
                </span>
              }
            >
              <ContentEditor
                value={contentValue}
                onChange={(newHtml) => {
                  setValue("content", newHtml);
                  if (!excerptValue) {
                    const plainText = newHtml.replace(/<[^>]*>/g, "").slice(0, 160);
                    setValue("excerpt", plainText);
                  }
                }}
                defaultMode={(watch("contentMode") as "visual" | "markdown" | "html") || "visual"}
                onModeChange={(mode) => setValue("contentMode", mode)}
              />
            </CollapsibleBox>

            {/* ========================================================
                YOAST SEO METABOX (MATCHING SCREENSHOTS EXACTLY)
            ======================================================== */}
            <CollapsibleBox
              id="yoast-seo-box"
              title="Yoast SEO"
              isOpen={openPanels.yoastSeo}
              onToggle={() => togglePanel("yoastSeo")}
              className="border-zinc-300"
              headerClassName="bg-white"
            >
              {/* Sub-Tabs: SEO, Readability, Schema, Social */}
              <div className="flex border-b border-zinc-200 -mt-2 -mx-5 px-5 gap-1 overflow-x-auto bg-zinc-50/50">
                <button
                  type="button"
                  onClick={() => setYoastTab("seo")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition ${
                    yoastTab === "seo"
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <span className={`size-2 rounded-full ${isSeoGood ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span>SEO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setYoastTab("readability")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition ${
                    yoastTab === "readability"
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Readability</span>
                </button>

                <button
                  type="button"
                  onClick={() => setYoastTab("schema")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition ${
                    yoastTab === "schema"
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Layers className="size-3 text-blue-500" />
                  <span>Schema</span>
                </button>

                <button
                  type="button"
                  onClick={() => setYoastTab("social")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition ${
                    yoastTab === "social"
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Share2 className="size-3 text-blue-500" />
                  <span>Social</span>
                </button>
              </div>

              {/* Yoast Brand Header */}
              <div className="pt-2 pb-1 border-b border-zinc-100">
                <span className="text-lg font-black tracking-tight text-purple-700">yoast</span>
                <p className="text-xs text-zinc-500">Optimize your content for discovery.</p>
              </div>

              {/* --- SEO TAB CONTENT --- */}
              {yoastTab === "seo" && (
                <div className="space-y-4 pt-2">
                  {/* Inner Accordion 1: Focus Keyphrase */}
                  <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleYoastInner("focusKeyphrase")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                    >
                      <span>Focus keyphrase</span>
                      {yoastInnerOpen.focusKeyphrase ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>

                    {yoastInnerOpen.focusKeyphrase && (
                      <div className="p-4 pt-0 border-t border-zinc-100 space-y-2">
                        <label className="block text-xs font-semibold text-zinc-700 mt-2">
                          Focus keyphrase
                        </label>
                        <input
                          type="text"
                          {...register("seo.focusKeyword")}
                          placeholder="Type here"
                          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder-zinc-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                        />
                        <p className="text-[11px] text-zinc-500">
                          Use the main word or phrase you want your content found for across search, AI, and beyond.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inner Accordion 2: Search Appearance (Google Preview + Title + Description) */}
                  <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleYoastInner("searchAppearance")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                    >
                      <span>Search appearance</span>
                      {yoastInnerOpen.searchAppearance ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>

                    {yoastInnerOpen.searchAppearance && (
                      <div className="p-4 pt-0 border-t border-zinc-100 space-y-4">

                        {/* Google Preview Mode Toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-zinc-700">Google preview</span>
                        </div>

                        {/* Google Search Snippet Box (Matching Screenshot) */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-2xs space-y-1.5 max-w-[620px]">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="size-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold">
                              O
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-800 text-[11px] leading-tight">Own The Digital</span>
                              <span className="text-zinc-400 font-mono text-[10px] leading-tight">
                                ownthedigital.com/{slugValue || "how-to-choose..."}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-base sm:text-lg font-medium text-blue-700 hover:underline cursor-pointer leading-snug">
                            {seoTitleValue || titleValue ? `${seoTitleValue || titleValue}` : "- Own The Digital"}
                          </h4>

                          <p className="text-xs text-zinc-600 leading-relaxed">
                            <span className="text-zinc-400">Sep 24, 2026 — </span>
                            {metaDescValue || excerptValue || "Please provide a meta description by editing the snippet below. If you don't, Google will try to find a relevant part of your post to show in the search results."}
                          </p>
                        </div>

                        {/* SEO Title Input with Variable Chips & Progress Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-zinc-700">SEO title</label>
                          </div>

                          <input
                            type="text"
                            {...register("seo.title")}
                            placeholder="How to Choose the Right AI Model - Own The Digital"
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder-zinc-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />

                          <ProgressBar current={seoTitleCount} minRecommended={40} maxRecommended={60} />
                          {errors.seo?.title && <p className="text-xs text-red-600">{errors.seo.title.message}</p>}
                        </div>

                        {/* Slug Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-700">Slug</label>
                          <input
                            type="text"
                            {...register("slug")}
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono placeholder-zinc-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>

                        {/* Meta Description with Variable Chips & Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-zinc-700">Meta description</label>
                          </div>

                          <textarea
                            rows={3}
                            {...register("seo.description")}
                            placeholder="Learn how to choose the right AI model based on performance, cost, accuracy and business requirements."
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder-zinc-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none"
                          />
                          <ProgressBar current={metaDescCount} minRecommended={120} maxRecommended={160} />
                          {errors.seo?.description && (
                            <p className="text-xs text-red-600">{errors.seo.description.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inner Accordion 3: SEO Analysis Checklist */}
                  <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleYoastInner("seoAnalysis")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${isSeoGood ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>SEO analysis</span>
                      </span>
                      {yoastInnerOpen.seoAnalysis ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>

                    {yoastInnerOpen.seoAnalysis && (
                      <div className="p-4 pt-2 border-t border-zinc-100 space-y-2.5 text-xs text-zinc-700">
                        <div className="flex items-center gap-2">
                          {hasFocusInTitle ? (
                            <span className="size-2 rounded-full bg-emerald-500" />
                          ) : (
                            <span className="size-2 rounded-full bg-red-500" />
                          )}
                          <span>
                            Focus keyphrase in SEO title:{" "}
                            {hasFocusInTitle ? "Good job!" : "Focus keyphrase does not appear in SEO title."}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasFocusInDesc ? (
                            <span className="size-2 rounded-full bg-emerald-500" />
                          ) : (
                            <span className="size-2 rounded-full bg-amber-500" />
                          )}
                          <span>
                            Keyphrase in meta description:{" "}
                            {hasFocusInDesc ? "Present." : "Add keyphrase to meta description for better CTR."}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isTitleGoodLength ? (
                            <span className="size-2 rounded-full bg-emerald-500" />
                          ) : (
                            <span className="size-2 rounded-full bg-amber-500" />
                          )}
                          <span>SEO title width: {seoTitleCount} characters ({isTitleGoodLength ? "Optimal" : "Adjust to 40-60"})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDescGoodLength ? (
                            <span className="size-2 rounded-full bg-emerald-500" />
                          ) : (
                            <span className="size-2 rounded-full bg-amber-500" />
                          )}
                          <span>Meta description length: {metaDescCount} characters ({isDescGoodLength ? "Optimal" : "Adjust to 120-160"})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {watch("featuredImage.altText") ? (
                            <span className="size-2 rounded-full bg-emerald-500" />
                          ) : (
                            <span className="size-2 rounded-full bg-red-500" />
                          )}
                          <span>Image alt attributes: {watch("featuredImage.altText") ? "Configured" : "Missing alt text"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inner Accordion 4: Advanced & Robots */}
                  <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleYoastInner("advanced")}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                    >
                      <span>Advanced settings</span>
                      {yoastInnerOpen.advanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>

                    {yoastInnerOpen.advanced && (
                      <div className="p-4 pt-2 border-t border-zinc-100 space-y-3">
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-800">
                            <input
                              type="checkbox"
                              {...register("seo.robotsIndex")}
                              className="size-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Allow search engines to index (Robots Index)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-800">
                            <input
                              type="checkbox"
                              {...register("seo.robotsFollow")}
                              className="size-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>Follow links (Robots Follow)</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700">Canonical URL</label>
                          <input
                            type="text"
                            {...register("seo.canonicalUrl")}
                            placeholder="https://ownthedigital.com/blogs/..."
                            className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs font-mono text-zinc-800 focus:border-purple-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- READABILITY TAB CONTENT --- */}
              {yoastTab === "readability" && (
                <div className="space-y-3 pt-3 text-xs text-zinc-700">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                    <strong>Readability Analysis: Good</strong>
                    <p className="mt-1 text-xs text-emerald-700">
                      Your article uses clear subheadings, concise paragraphs, and accessible vocabulary.
                    </p>
                  </div>
                  <ul className="space-y-2 pl-4 list-disc text-zinc-600">
                    <li>Paragraph length: Good (concise blocks).</li>
                    <li>Subheading distribution: Section headings break up text nicely.</li>
                    <li>Sentence length: Optimal for online scanning.</li>
                  </ul>
                </div>
              )}

              {/* --- SCHEMA TAB CONTENT --- */}
              {yoastTab === "schema" && (
                <div className="space-y-4 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700">Schema Type</label>
                    <select
                      {...register("seo.schemaType")}
                      className="mt-1 block w-full rounded border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 focus:border-purple-600 focus:outline-none cursor-pointer"
                    >
                      <option value="BlogPosting">BlogPosting (Recommended)</option>
                      <option value="Article">Article</option>
                      <option value="TechArticle">TechArticle</option>
                      <option value="NewsArticle">NewsArticle</option>
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Headline:</span>
                      <p className="font-semibold text-zinc-800 truncate">{titleValue || "Blog Title"}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Author:</span>
                      <p className="font-semibold text-zinc-800">{typeof authorValue === "string" ? authorValue : authorValue?.name || "Own The Digital Team"}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowJsonLdPreview(!showJsonLdPreview)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    <FileCode className="size-3.5" />
                    <span>{showJsonLdPreview ? "Hide JSON-LD output" : "Inspect JSON-LD output"}</span>
                  </button>

                  {showJsonLdPreview && (
                    <pre className="rounded bg-zinc-900 p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[200px]">
                      {JSON.stringify(
                        {
                          "@context": "https://schema.org",
                          "@type": schemaTypeValue,
                          headline: titleValue,
                          description: metaDescValue || excerptValue,
                          image: [featuredImageUrl],
                          author: [{ "@type": "Person", name: typeof authorValue === "string" ? authorValue : "Own The Digital Team" }],
                          publisher: { "@type": "Organization", name: "Own The Digital", url: "https://ownthedigital.com" },
                        },
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              )}


              {/* --- SOCIAL TAB CONTENT --- */}
              {yoastTab === "social" && (
                <div className="space-y-4 pt-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Facebook / LinkedIn Title</label>
                      <input
                        type="text"
                        {...register("social.ogTitle")}
                        placeholder={seoTitleValue || titleValue}
                        className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Twitter / X Title</label>
                      <input
                        type="text"
                        {...register("social.twitterTitle")}
                        placeholder={seoTitleValue || titleValue}
                        className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">Social Description</label>
                    <textarea
                      rows={2}
                      {...register("social.ogDescription")}
                      placeholder={metaDescValue || excerptValue}
                      className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:border-purple-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </CollapsibleBox>

            {/* Excerpt Collapsible Panel (Image 2) */}
            <CollapsibleBox
              title="Excerpt"
              isOpen={openPanels.excerpt}
              onToggle={() => togglePanel("excerpt")}
            >
              <textarea
                rows={4}
                {...register("excerpt")}
                placeholder="Learn how to select the right AI model based on performance, cost, accuracy, and your business requirements."
                className="w-full rounded-md border border-zinc-300 p-3 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-zinc-500">
                Excerpts are optional hand-crafted summaries of your content that can be used in your theme.
              </p>
            </CollapsibleBox>

            {/* Internal Linking & Related Articles Collapsible Panel (Image 2) */}
            <CollapsibleBox
              title="Related Blogs / Internal Links"
              isOpen={openPanels.relatedBlogs}
              onToggle={() => togglePanel("relatedBlogs")}
              badge={
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                  {relatedBlogsValue.length} linked
                </span>
              }
            >
              <div className="space-y-3">
                {relatedBlogsValue.length > 0 ? (
                  <div className="space-y-2">
                    {relatedBlogsValue.map((item, idx) => (
                      <div
                        key={item.slug}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="size-5 rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-zinc-800">{item.title}</span>
                          <span className="text-[11px] font-mono text-zinc-400">/blogs/{item.slug}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRelatedBlog(item.slug)}
                          className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No related articles linked yet.</p>
                )}

                {/* Add Custom Related Article */}
                <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-zinc-100">
                  <input
                    type="text"
                    value={customRelatedTitle}
                    onChange={(e) => setCustomRelatedTitle(e.target.value)}
                    placeholder="Article title..."
                    className="rounded border border-zinc-300 px-3 py-1.5 text-xs placeholder-zinc-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customRelatedSlug}
                      onChange={(e) => setCustomRelatedSlug(e.target.value)}
                      placeholder="slug (e.g. what-is-rag)"
                      className="w-full rounded border border-zinc-300 px-3 py-1.5 text-xs font-mono placeholder-zinc-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomRelated}
                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Quick pick from published database blogs */}
                {availableBlogs.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                      Pick from published articles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableBlogs
                        .filter((b) => b.slug !== slugValue)
                        .slice(0, 6)
                        .map((b) => {
                          const isAdded = relatedBlogsValue.some((r) => r.slug === b.slug);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              disabled={isAdded}
                              onClick={() =>
                                addRelatedBlog({
                                  id: b.id,
                                  title: b.title,
                                  slug: b.slug,
                                  excerpt: b.excerpt,
                                  image: b.image,
                                  category: b.category,
                                })
                              }
                              className={`rounded border px-2 py-1 text-xs cursor-pointer transition ${
                                isAdded
                                  ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                                  : "border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100"
                              }`}
                            >
                              {isAdded ? "✓ " : "+ "}
                              {b.title}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleBox>
          </div>

          {/* ========================================================
              RIGHT SIDEBAR: Post Attributes, Featured Image, Tags
          ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publish Meta-Box (Matching Image 1) */}
            <CollapsibleBox
              title="Publish"
              isOpen={openPanels.publish}
              onToggle={() => togglePanel("publish")}
              headerClassName="bg-zinc-50"
            >
              <div className="space-y-3.5 text-xs text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <select
                    {...register("status")}
                    className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800 cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Visibility:</span>
                  <strong className="text-zinc-800">Public</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Publish immediately:</span>
                  <input
                    type="datetime-local"
                    {...register("publishedAt")}
                    className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-800"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  {blog ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Move to Trash
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs transition disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : blog ? "Update" : "Publish"}
                  </button>
                </div>
              </div>
            </CollapsibleBox>

            {/* Post Attributes Meta-Box (Matching Image 1) */}
            <CollapsibleBox
              title="Post Attributes"
              isOpen={openPanels.postAttributes}
              onToggle={() => togglePanel("postAttributes")}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">Template</label>
                  <select className="mt-1 block w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-800 cursor-pointer">
                    <option value="default">Default template</option>
                    <option value="full-width">Full width template</option>
                    <option value="landing">Landing page template</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700">Category</label>
                  <input
                    type="text"
                    {...register("category")}
                    placeholder="e.g. Artificial Intelligence"
                    list="category-suggestions"
                    className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                  <datalist id="category-suggestions">
                    <option value="Artificial Intelligence" />
                    <option value="Digital Marketing" />
                    <option value="SEO & Growth" />
                    <option value="Web Development" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700">Author</label>
                  <input
                    type="text"
                    {...register("author")}
                    placeholder="e.g. Own The Digital Team"
                    className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700">Read Time</label>
                  <input
                    type="text"
                    {...register("readTime")}
                    placeholder="5 Mins"
                    className="mt-1 block w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </CollapsibleBox>

            {/* Featured Image Meta-Box (Matching Image 2) */}
            <CollapsibleBox
              title="Featured image"
              isOpen={openPanels.featuredImage}
              onToggle={() => togglePanel("featuredImage")}
            >
              <div className="space-y-3">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                />

                {/* Image Preview & Drag-and-Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  className={`group relative aspect-[16/10] w-full overflow-hidden rounded-lg border transition-all ${
                    isDraggingOver
                      ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-400"
                      : "border-zinc-200 bg-zinc-50"
                  } flex items-center justify-center`}
                >
                  {isUploadingImage && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-xs text-blue-600">
                      <Loader2 className="size-7 animate-spin mb-1.5" />
                      <span className="text-xs font-semibold">Uploading image...</span>
                    </div>
                  )}

                  {featuredImageUrl ? (
                    <>
                      <Image
                        src={featuredImageUrl}
                        alt={watch("featuredImage.altText") || "Featured preview"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* Action buttons overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="inline-flex items-center gap-1 rounded bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-white hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Upload className="size-3.5" />
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFeaturedImage}
                          className="inline-flex items-center gap-1 rounded bg-white/95 px-2.5 py-1 text-xs font-semibold text-red-600 shadow-xs hover:bg-white hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center text-zinc-400 p-4 text-center cursor-pointer hover:text-zinc-600 transition-colors w-full h-full justify-center"
                    >
                      <div className="rounded-full bg-zinc-100 p-2.5 mb-2 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Upload className="size-5" />
                      </div>
                      <span className="text-xs font-medium text-zinc-700">Click to upload or drag & drop</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG, WEBP, GIF, SVG up to 10MB</span>
                    </div>
                  )}
                </div>

                {/* Upload Status / Error alert */}
                {uploadError && (
                  <div className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                    <AlertCircle className="size-4 shrink-0" />
                    <span className="text-[11px] leading-tight flex-1">{uploadError}</span>
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="text-red-500 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Quick actions: Upload button & Auto-fill meta */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100/70 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" />
                        {featuredImageUrl ? "Upload New Image" : "Upload Image"}
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-zinc-600">Image URL *</label>
                    {featuredImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveFeaturedImage}
                        className="text-[11px] text-zinc-400 hover:text-red-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    {...register("featuredImage.url")}
                    onChange={(e) => {
                      setValue("featuredImage.url", e.target.value);
                      setValue("image", e.target.value);
                    }}
                    placeholder="https://... or /uploads/..."
                    className="mt-1 block w-full rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-800 focus:outline-none"
                  />
                  {errors.featuredImage?.url && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.featuredImage.url.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600">
                    Alt Text * (Mandatory for SEO/a11y)
                  </label>
                  <input
                    type="text"
                    {...register("featuredImage.altText")}
                    placeholder="e.g. AI model selection comparison"
                    className="mt-1 block w-full rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-800 focus:outline-none"
                  />
                  {errors.featuredImage?.altText && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.featuredImage.altText.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600">Image Title</label>
                  <input
                    type="text"
                    {...register("featuredImage.title")}
                    placeholder="AI Model Selection Guide"
                    className="mt-1 block w-full rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600">Caption</label>
                  <input
                    type="text"
                    {...register("featuredImage.caption")}
                    placeholder="Choosing the right AI model based on business requirements."
                    className="mt-1 block w-full rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </CollapsibleBox>

            {/* Tags Meta-Box (Matching Image 2) */}
            <CollapsibleBox
              title="Tags"
              isOpen={openPanels.tags}
              onToggle={() => togglePanel("tags")}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add new tag"
                    className="w-full rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded border border-blue-600 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400">Separate tags with commas</p>

                {/* Active tag chips */}
                <div className="flex flex-wrap gap-1.5">
                  {tagsValue.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-zinc-400 hover:text-red-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-[11px] text-blue-600 underline cursor-pointer block mb-1">
                    Choose from the most used tags
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px] text-zinc-500">
                    {["AI Models", "LLM", "RAG", "Small Language Models", "SEO", "Machine Learning"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          if (!tagsValue.includes(t)) setValue("tags", [...tagsValue, t]);
                        }}
                        className="hover:text-blue-600 underline cursor-pointer"
                      >
                        {t},
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleBox>
          </div>
        </div>
      </form>
    </div>
  );
}
