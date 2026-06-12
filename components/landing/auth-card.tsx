"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { authenticate, register } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v2.98h3.93c2.3-2.12 3.62-5.24 3.62-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.93-2.98c-1.08.72-2.45 1.16-4 1.16-3.08 0-5.69-2.08-6.62-4.88H1.36v3.07C3.33 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.38 14.38c-.24-.72-.38-1.49-.38-2.38s.14-1.66.38-2.38V6.55H1.36C.5 8.24 0 10.06 0 12s.5 3.76 1.36 5.45l4.02-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.49-3.49C17.95 1.19 15.24 0 12 0 7.31 0 3.33 2.7 1.36 6.55l4.02 3.07C6.31 6.83 8.92 4.75 12 4.75z"
      />
    </svg>
  );
}

export function AuthCard() {
  const [signInState, signInAction, signInPending] = useActionState(authenticate, null);
  const [signUpState, signUpAction, signUpPending] = useActionState(register, null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="border-white/10 bg-white/[0.04] py-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Secure Access
            </span>
          </div>
          <CardTitle className="text-2xl">Welcome to AssetFlow</CardTitle>
          <CardDescription>
            Sign in or create an account to start booking and managing shared assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form action={signInAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
                {signInState?.error && (
                  <p className="text-sm text-destructive">{signInState.error}</p>
                )}
                <Button type="submit" className="w-full" disabled={signInPending}>
                  {signInPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form action={signUpAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                {signUpState?.error && (
                  <p className="text-sm text-destructive">{signUpState.error}</p>
                )}
                <Button type="submit" className="w-full" disabled={signUpPending}>
                  {signUpPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  New accounts are created with the Consumer role.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
