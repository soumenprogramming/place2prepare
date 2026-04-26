"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center app-shell-bg p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {state === "processing" ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we activate Premium on your account.
            </p>
          </>
        ) : state === "success" ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
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
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/billing"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Go to billing
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Payment could not be confirmed
            </h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/billing"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open billing
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
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
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center app-shell-bg text-sm text-slate-500">
          Loading…
        </main>
      }
    >
      <CompleteInner />
    </Suspense>
  );
}
