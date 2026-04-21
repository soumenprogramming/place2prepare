"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError("");
    setSuccessMessage("");
    try {
      await requestPasswordReset({ email: values.email });
      setSuccessMessage(
        "If an account exists for that email, a reset link has been sent. Check your inbox (and the server console in development)."
      );
      reset({ email: "" });
    } catch (error) {
      setApiError(
        extractErrorMessage(error, "Couldn't send the reset link right now.")
      );
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset link."
      footerText="Remember your password?"
      footerLinkText="Back to login"
      footerHref="/login"
    >
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

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        You can also{" "}
        <Link href="/register" className="font-semibold text-primary">
          create a new account
        </Link>
        .
      </p>
    </AuthShell>
  );
}
