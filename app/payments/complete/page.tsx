"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { confirmMockOrder } from "@/lib/api/payments";
import { extractErrorMessage } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";

type State = "processing" | "success" | "failed";

function CompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const [state, setState] = useState<State>("processing");
  const [error, setError] = useState("");
  const [orderTitle, setOrderTitle] = useState("");
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const session = getSession();
    if (!session) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          orderIdParam ? `/payments/complete?orderId=${orderIdParam}` : "/billing"
        )}`
      );
      return;
    }
    if (!orderIdParam) {
      setState("failed");
      setError("Missing order id. Check your billing page for details.");
      return;
    }
    const orderId = Number.parseInt(orderIdParam, 10);
    if (Number.isNaN(orderId)) {
      setState("failed");
      setError("Invalid order id.");
      return;
    }

    confirmMockOrder(session.token, orderId)
      .then((order) => {
        setOrderTitle(order.courseTitle);
        setState("success");
        window.setTimeout(() => router.push("/billing"), 2200);
      })
      .catch((err) => {
        setState("failed");
        setError(extractErrorMessage(err, "Couldn't confirm this payment."));
      });
  }, [orderIdParam, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6fb] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.1),transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-9 text-center shadow-[0_24px_60px_-28px_rgba(15,23,42,0.15)] ring-1 ring-white backdrop-blur-sm">
        {state === "processing" ? (
          <>
            <div className="relative mx-auto w-fit">
              <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-400/25 blur-xl" />
              <Loader2 className="relative mx-auto h-11 w-11 animate-spin text-indigo-600" strokeWidth={2} />
            </div>
            <h1 className="font-display mt-5 text-xl font-extrabold tracking-tight text-slate-900">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Please wait while we activate Premium on your account.
            </p>
          </>
        ) : state === "success" ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-2 ring-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" strokeWidth={2} />
            </div>
            <h1 className="font-display mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
              Premium activated
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {orderTitle
                ? `You're now on the Premium plan for ${orderTitle}.`
                : "Your Premium plan is now active."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Redirecting you to your billing page…
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/billing"
                className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-110"
              >
                Go to billing
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 ring-2 ring-rose-100">
              <XCircle className="h-9 w-9 text-rose-500" strokeWidth={2} />
            </div>
            <h1 className="font-display mt-5 text-xl font-extrabold tracking-tight text-slate-900">
              Payment could not be confirmed
            </h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/billing"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Open billing
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow-sm hover:brightness-110"
              >
                Back to dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={<PageLoader message="Preparing checkout…" />}>
      <CompleteInner />
    </Suspense>
  );
}
