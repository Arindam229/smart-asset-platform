"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/password-reset";
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

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/[0.04] py-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Secure Access
          </span>
        </div>
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>
          Enter the email associated with your account and we&apos;ll send you a link to
          reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <p className="text-sm text-muted-foreground">{state.success}</p>
        ) : (
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
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
