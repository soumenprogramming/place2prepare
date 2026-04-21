"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerAdmin } from "@/lib/api/auth";
import { extractErrorMessage, extractFieldErrors } from "@/lib/api/client";
import { getSession, homePathForRole, setSession } from "@/lib/auth/session";

const adminRegisterSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    setupKey: z.string().min(1, "Admin setup key is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type AdminRegisterFormValues = z.infer<typeof adminRegisterSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminRegisterFormValues>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      setupKey: "",
    },
  });

  useEffect(() => {
    const existing = getSession();
    if (existing) {
      router.replace(homePathForRole(existing.role));
    }
  }, [router]);

  const onSubmit = async (values: AdminRegisterFormValues) => {
    setApiError("");
    try {
      const response = await registerAdmin({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        setupKey: values.setupKey,
      });
      setSession(response.token, response.role);
      router.push("/admin/dashboard");
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (
            field === "fullName" ||
            field === "email" ||
            field === "password" ||
            field === "confirmPassword" ||
            field === "setupKey"
          ) {
            setError(field, { message });
          }
        });
      }
      setApiError(extractErrorMessage(error, "Unable to create admin account."));
    }
  };

  return (
    <AuthShell
      title="Create admin account"
      subtitle="Set up administrator access for platform management."
      footerText="Already have admin access?"
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
          placeholder="Admin Name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          id="email"
          label="Admin email"
          type="email"
          placeholder="admin@place2prepare.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Minimum 6 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Input
          id="setupKey"
          label="Admin setup key"
          placeholder="Enter secure setup key"
          error={errors.setupKey?.message}
          {...register("setupKey")}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create admin account
        </Button>
      </form>
    </AuthShell>
  );
}
