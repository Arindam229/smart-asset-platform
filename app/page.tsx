import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { auth } from "@/lib/auth";
import { GridBackground } from "@/components/landing/grid-background";
import { Spotlight } from "@/components/landing/spotlight";
import { TextGenerateEffect } from "@/components/landing/text-generate-effect";
import { FeatureHighlights } from "@/components/landing/feature-highlights";
import { AuthCard } from "@/components/landing/auth-card";



export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="dark relative flex min-h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <GridBackground />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="oklch(0.7 0.15 290)" />

      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 animate-float rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 animate-float-delayed rounded-full bg-violet-500/10 blur-3xl" />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Boxes className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AssetFlow</span>
        </div>
        <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground sm:inline-block">
          Smart Asset Management &amp; Resource Allocation
        </span>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-12 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:px-16 lg:py-16">
        <div className="flex w-full max-w-xl flex-col gap-6 lg:w-1/2">
          <TextGenerateEffect
            words="Smart Asset Management, Reimagined"
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          />
          <p className="animate-grid-fade text-base text-muted-foreground sm:text-lg">
            One platform to track inventory, request bookings, manage approval workflows, and
            monitor utilization across every shared resource in your organization — in real time.
          </p>
          <FeatureHighlights />
        </div>

        <div className="flex w-full justify-center lg:w-1/2">
          <AuthCard />
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-xs text-muted-foreground sm:px-10 lg:px-16">
        Built with Next.js, Neon Postgres, and Auth.js — deployed on Cloudflare Pages.
      </footer>
    </main>
  );
}
