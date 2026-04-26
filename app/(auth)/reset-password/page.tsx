"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { confirmPasswordReset } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [missingToken, setMissingToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      setMissingToken(true);
    }
  }, [token]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setApiError("");
    setSuccessMessage("");
    if (!token) {
      setApiError("This reset link is missing its token.");
      return;
    }
    try {
      await confirmPasswordReset({
        token,
        newPassword: values.newPassword,
      });
      setSuccessMessage(
        "Your password has been updated. Redirecting you to sign in..."
      );
      setTimeout(() => router.push("/login"), 1800);
    } catch (error) {
      setApiError(
        extractErrorMessage(
          error,
          "This reset link is invalid or has expired. Request a new one."
        )
      );
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something strong — at least 8 characters."
      footerText="Back to"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      {missingToken ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            This reset link is missing its token. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {apiError}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <PasswordInput
            id="newPassword"
            label="New password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm new password"
            placeholder="Re-type your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center app-shell-bg text-sm text-slate-500">
          Loading...
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
