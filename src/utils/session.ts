import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "fallback_secret_key_at_least_32_characters_for_signing_cookies";
const COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE || "otd_admin_session";

export type SessionPayload = {
  email: string;
  name: string;
  userId: string;
  expiresAt: string;
};

export function signSession(payload: Omit<SessionPayload, "expiresAt">): string {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
  const data = JSON.stringify({ ...payload, expiresAt });
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return `${Buffer.from(data).toString("base64")}.${signature}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) return null;

    const data = Buffer.from(base64Payload, "base64").toString("utf8");
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("hex");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(data) as SessionPayload;
    if (new Date(payload.expiresAt) < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSession(payload: Omit<SessionPayload, "expiresAt">) {
  const token = signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 1 day
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
