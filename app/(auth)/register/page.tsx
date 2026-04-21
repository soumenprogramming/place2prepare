"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/api/auth";
import { extractErrorMessage, extractFieldErrors } from "@/lib/api/client";
import { getSession, homePathForRole } from "@/lib/auth/session";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const existing = getSession();
    if (existing) {
      router.replace(homePathForRole(existing.role));
    }
  }, [router]);

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError("");
    try {
      await registerUser({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password.trim(),
      });
      // Do not store the token here — user should sign in explicitly on /login.
      router.push("/login?registered=1");
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (
            field === "fullName" ||
            field === "email" ||
            field === "password" ||
            field === "confirmPassword"
          ) {
            setError(field, { message });
          }
        });
      }
      setApiError(extractErrorMessage(error, "Unable to create account right now."));
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Place2Prepare and start learning today."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiError}
          </p>
        ) : null}
        <Input
          id="fullName"
          label="Full name"
          placeholder="Soumen Das"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
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
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wider text-slate-400">Or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <SocialLoginButtons />
    </AuthShell>
  );
}
