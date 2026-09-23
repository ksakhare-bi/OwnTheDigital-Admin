import { NextResponse } from "next/server";
import {
  getPublishedBlogBySlug,
  getBlogById,
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

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let blog = await getPublishedBlogBySlug(slug);

    // If not found by slug and might be an ObjectId, try by id
    if (!blog && /^[0-9a-fA-F]{24}$/.test(slug)) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, error: `Blog not found for slug: ${slug}` },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: blog },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch blog";
    console.error("GET /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
