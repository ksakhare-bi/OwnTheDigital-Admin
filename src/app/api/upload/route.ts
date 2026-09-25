import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

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

    // Clean and sanitize base filename
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

    // 1. Primary: Cloudinary Cloud Upload
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadToCloudinary(buffer, {
          publicId: `${baseName}-${uniqueSuffix}`,
        });

        return NextResponse.json(
          {
            success: true,
            url: uploadResult.url,
            filename: uploadResult.publicId,
            publicId: uploadResult.publicId,
            originalName,
            size: uploadResult.bytes || file.size,
            mimeType: file.type,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            provider: "cloudinary",
          },
          { status: 201, headers: corsHeaders }
        );
      } catch (cloudinaryErr: unknown) {
        console.error("Cloudinary upload failed:", cloudinaryErr);
        const errorMsg =
          cloudinaryErr instanceof Error
            ? cloudinaryErr.message
            : "Cloudinary upload failed";
        return NextResponse.json(
          {
            success: false,
            error: `Image upload failed: ${errorMsg}`,
          },
          { status: 502, headers: corsHeaders }
        );
      }
    }

    // 2. If Cloudinary is not configured:
    // In production, we MUST fail explicitly with actionable advice because local disk is read-only or ephemeral
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Upload failed: Cloudinary environment variables are missing in production."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your production environment settings.",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Fallback for local development only if Cloudinary credentials are not yet set
    console.warn(
      "[Upload] Cloudinary credentials missing in dev, falling back to local public/uploads"
    );
    const finalFilename = `${baseName}-${uniqueSuffix}${extension}`;
    const adminUploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(adminUploadDir)) {
      await mkdir(adminUploadDir, { recursive: true });
    }
    await writeFile(path.join(adminUploadDir, finalFilename), buffer);

    try {
      const websiteUploadDir = path.resolve(
        process.cwd(),
        "..",
        "website",
        "public",
        "uploads"
      );
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
        provider: "local",
        warning:
          "Uploaded locally because Cloudinary is not configured. For production, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("POST /api/upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
