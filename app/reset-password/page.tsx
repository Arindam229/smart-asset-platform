import { GridBackground } from "@/components/landing/grid-background";
import { Spotlight } from "@/components/landing/spotlight";
import { ResetPasswordForm } from "@/components/landing/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="dark relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <GridBackground />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <div className="relative z-10 flex w-full justify-center">
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </main>
  );
}
