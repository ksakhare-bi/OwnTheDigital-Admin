import { NextResponse } from "next/server";
import { registerAdmin } from "@/services/auth.service";
import { registerSchema } from "@/lib/validations/auth";

export async function GET() {
  return NextResponse.json({
    message: "Admin Registration Endpoint",
    description: "Send a POST request with JSON body to register or seed the admin user.",
    defaultCredentials: {
      email: "admin@ownthedigital.com",
      password: "Password123!",
      name: "Admin",
    },
    options: {
      overwrite: "Set overwrite: true in request body or ?overwrite=true in URL to update existing admin credentials.",
    },
  });
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};

    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const overwriteParam = url.searchParams.get("overwrite");
    const overwrite =
      body.overwrite === true ||
      overwriteParam === "true" ||
      overwriteParam === "1";

    const payload = {
      email: typeof body.email === "string" && body.email.trim() ? body.email.trim() : "admin@ownthedigital.com",
      password: typeof body.password === "string" && body.password.length > 0 ? body.password : "Password123!",
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Admin",
    };

    const validation = registerSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, error: firstError, details: validation.error.issues },
        { status: 400 }
      );
    }

    const { user, isNew } = await registerAdmin(validation.data, { overwrite });

    return NextResponse.json(
      {
        success: true,
        message: isNew
          ? "Admin user created successfully"
          : "Admin user credentials updated successfully",
        user,
      },
      { status: isNew ? 201 : 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register admin";
    const isExisting = message.toLowerCase().includes("already exists");

    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(isExisting
          ? {
              hint: "An admin with this email already exists. To update the password, provide ?overwrite=true or { overwrite: true } in the request body.",
            }
          : {}),
      },
      { status: isExisting ? 409 : 500 }
    );
  }
}
