"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  if (!token) {
    return (
      <Card className="w-full max-w-md border-white/10 bg-white/[0.04] py-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Secure Access
            </span>
          </div>
          <CardTitle className="text-2xl">Invalid reset link</CardTitle>
          <CardDescription>
            This password reset link is missing or invalid. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/forgot-password">
            <Button className="w-full">Request a new link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/[0.04] py-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Secure Access
          </span>
        </div>
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{state.success}</p>
            <Link href="/">
              <Button className="w-full">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset password
            </Button>
          </form>
        )}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
