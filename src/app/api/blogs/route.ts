import { NextResponse } from "next/server";
import {
  listPublishedBlogs,
  listBlogs,
  getPublishedBlogBySlug,
} from "@/services/blogs.service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const publishedParam = searchParams.get("published");

    // If a specific slug is requested via query param
    if (slug) {
      const blog = await getPublishedBlogBySlug(slug);
      if (!blog) {
        return NextResponse.json(
          { success: false, error: "Blog not found" },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { success: true, data: blog },
        { status: 200, headers: corsHeaders }
      );
    }

    // Default to published blogs for public consumption
    if (publishedParam === "all" || publishedParam === "false") {
      const blogs = await listBlogs();
      return NextResponse.json(
        { success: true, count: blogs.length, data: blogs },
        { status: 200, headers: corsHeaders }
      );
    }

    const blogs = await listPublishedBlogs({ category, tag });
    return NextResponse.json(
      { success: true, count: blogs.length, data: blogs },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch blogs";
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
