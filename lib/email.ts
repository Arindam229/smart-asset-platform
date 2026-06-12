import nodemailer from "nodemailer";

declare global {
  var __mailTransporter: ReturnType<typeof nodemailer.createTransport> | undefined;
}

function getTransporter() {
  if (!global.__mailTransporter) {
    global.__mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return global.__mailTransporter;
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  await getTransporter().sendMail({
    from: `"AssetFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your AssetFlow password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset the password for your AssetFlow account. Click the button below to choose a new password.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br />${resetUrl}</p>
      </div>
    `,
  });
}

export async function sendNotificationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await getTransporter().sendMail({
    from: `"AssetFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
