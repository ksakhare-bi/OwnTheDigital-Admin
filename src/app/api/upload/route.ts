import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate MIME type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Supported types: JPG, PNG, WEBP, GIF, SVG, AVIF.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Limit to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit." },
        { status: 400, headers: corsHeaders }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Clean and sanitize filename
    const originalName = (file as File).name || "image.png";
    const extension = path.extname(originalName).toLowerCase() || ".png";
    const baseName = path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "upload";

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalFilename = `${baseName}-${uniqueSuffix}${extension}`;

    // Target upload directories:
    // 1. Admin public/uploads
    const adminUploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(adminUploadDir)) {
      await mkdir(adminUploadDir, { recursive: true });
    }
    await writeFile(path.join(adminUploadDir, finalFilename), buffer);

    // 2. Also website public/uploads for shared preview if local
    try {
      const websiteUploadDir = path.resolve(process.cwd(), "..", "website", "public", "uploads");
      const websitePublicDir = path.resolve(process.cwd(), "..", "website", "public");
      if (existsSync(websitePublicDir)) {
        if (!existsSync(websiteUploadDir)) {
          await mkdir(websiteUploadDir, { recursive: true });
        }
        await writeFile(path.join(websiteUploadDir, finalFilename), buffer);
      }
    } catch {
      // Non-fatal if website folder is not reachable
    }

    const publicUrl = `/uploads/${finalFilename}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        filename: finalFilename,
        originalName,
        size: file.size,
        mimeType: file.type,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("POST /api/upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
