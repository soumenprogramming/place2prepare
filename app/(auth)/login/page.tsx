"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/lib/api/auth";
import { extractErrorMessage, extractFieldErrors } from "@/lib/api/client";
import { getSession, homePathForRole, setSession } from "@/lib/auth/session";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

function safeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState("");
  const [registeredNotice, setRegisteredNotice] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError("");
    try {
      const response = await loginUser({
        email: values.email.trim(),
        password: values.password.trim(),
      });
      setSession(response.token, response.role);
      const redirectTo = safeRedirect(searchParams.get("redirect"));
      router.push(redirectTo ?? homePathForRole(response.role === "ADMIN" ? "ADMIN" : "STUDENT"));
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (field === "email" || field === "password") {
            setError(field, { message });
          }
        });
      }
      setApiError(extractErrorMessage(error, "Unable to log in right now."));
    }
  };

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setRegisteredNotice(true);
      router.replace("/login");
    }
  }, [router, searchParams]);

  useEffect(() => {
    const socialToken = searchParams.get("token");
    const socialRole = searchParams.get("role");
    const socialError = searchParams.get("error");

    if (socialError) {
      if (socialError === "already_logged_in") {
        setApiError("This account is already logged in on another device.");
      } else if (socialError === "social_email_missing") {
        setApiError("We could not fetch an email from the social provider.");
      } else {
        setApiError("Social login failed. Please try again.");
      }
      router.replace("/login");
      return;
    }

    if (socialToken && socialRole) {
      setSession(socialToken, socialRole);
      const redirectTo = safeRedirect(searchParams.get("redirect"));
      router.replace(
        redirectTo ?? homePathForRole(socialRole === "ADMIN" ? "ADMIN" : "STUDENT")
      );
      return;
    }

    const existing = getSession();
    if (existing) {
      const redirectTo = safeRedirect(searchParams.get("redirect"));
      router.replace(redirectTo ?? homePathForRole(existing.role));
    }
  }, [router, searchParams]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your learning journey."
      footerText="New to Place2Prepare?"
      footerLinkText="Create an account"
      footerHref="/register"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {registeredNotice ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Account created. Sign in with your email and password to continue.
          </p>
        ) : null}
        {apiError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiError}
          </p>
        ) : null}
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <Checkbox
              checked={watch("rememberMe")}
              onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wider text-slate-400">Or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <SocialLoginButtons />
      <p className="mt-4 text-center text-xs text-slate-500">
        Need administrator access?{" "}
        <Link href="/admin-register" className="font-semibold text-primary">
          Create admin account
        </Link>
      </p>
    </AuthShell>
  );
}
