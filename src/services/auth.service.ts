import { AdminModel } from "@/models/admin.model";
import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { AdminUser, LoginInput } from "@/types/auth";
import { getSession, setSession, destroySession } from "@/utils/session";

// Ensure at least one admin user exists in the database
async function ensureAdminUser() {
  await connectToDatabase();
  const count = await AdminModel.countDocuments();
  if (count === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password123!", salt);
    await AdminModel.create({
      email: "admin@ownthedigital.com",
      name: "Default Admin",
      passwordHash,
    });
    console.log("Seeded default admin user: admin@ownthedigital.com / Password123!");
  }
}

export async function loginAdmin(input: LoginInput): Promise<AdminUser | null> {
  await connectToDatabase();
  await ensureAdminUser();

  const admin = await AdminModel.findOne({ email: input.email.toLowerCase().trim() });
  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(input.password, admin.passwordHash);
  if (!isValid) {
    return null;
  }

  const user: AdminUser = {
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
  };

  await setSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return user;
}

export async function logoutAdmin(): Promise<void> {
  await destroySession();
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    name: session.name,
  };
}
