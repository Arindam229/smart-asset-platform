"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";

export type ResetFormState = {
  error?: string;
  success?: string;
} | null;

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return bcrypt.hashSync(token, 1); // Fast hash for tokens
}

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function requestPasswordReset(
  _prevState: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Always return the same message, whether or not the account exists,
  // so this form can't be used to enumerate registered emails.
  if (user) {
    const rawToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  }

  return {
    success: "If an account exists for that email, we've sent a password reset link.",
  };
}

export async function resetPassword(
  _prevState: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "Missing or invalid reset token." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const tokenHash = hashToken(token);
  const record = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.tokenHash, tokenHash),
  });

  if (!record || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, record.id));

  return { success: "Your password has been reset. You can now sign in." };
}
