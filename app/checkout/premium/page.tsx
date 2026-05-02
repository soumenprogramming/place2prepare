"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Sparkles } from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import { getCatalogCourses, type CatalogCourse } from "@/lib/api/catalog";
import { startCheckout } from "@/lib/api/payments";
import { MarketingShell } from "@/components/marketing/page-shell";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { canActAsLearner, getSession } from "@/lib/auth/session";

type Phase = "auth" | "loading" | "redirecting" | "pick" | "error";

export default function PremiumCheckoutPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [premiumCourses, setPremiumCourses] = useState<CatalogCourse[]>([]);
  const [error, setError] = useState("");
  const [busyCourseId, setBusyCourseId] = useState<number | null>(null);

  const beginCheckout = useCallback(async (token: string, courseId: number) => {
    setBusyCourseId(courseId);
    setError("");
    try {
      const res = await startCheckout(token, courseId);
      const url = (res.checkoutUrl ?? "").trim();
      if (!url) {
        setError(
          "The server did not return a payment URL. Try again or open Billing for pending orders."
        );
        setPhase("error");
        return;
      }
      setPhase("redirecting");
      window.location.assign(url);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not start payment."));
      setPhase("error");
    } finally {
      setBusyCourseId(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function run() {
      const session = getSession();
      if (!session || !canActAsLearner(session.role)) {
        if (active) setPhase("auth");
        router.replace(`/login?redirect=${encodeURIComponent("/checkout/premium")}`);
        return;
      }

      if (active) setPhase("loading");
      try {
        const all = await getCatalogCourses();
        if (!active) return;
        const premium = all.filter((c) => c.premium);
        if (premium.length === 0) {
          setError(
            "No Premium-priced courses are available in the catalog yet. Ask an admin to mark at least one course as Premium, or browse all courses."
          );
          setPhase("error");
          return;
        }
        if (premium.length === 1) {
          if (!active) return;
          setPhase("redirecting");
          await beginCheckout(session.token, premium[0].id);
          return;
        }
        if (!active) return;
        setPremiumCourses(premium);
        setPhase("pick");
      } catch (err) {
        if (!active) return;
        setError(extractErrorMessage(err, "Could not load courses."));
        setPhase("error");
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, [router, beginCheckout]);

  if (phase === "auth") {
    return (
      <MarketingShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
          <PageLoader message="Sign in to continue to checkout…" />
        </div>
      </MarketingShell>
    );
  }

  if (phase === "loading" || phase === "redirecting") {
    return (
      <MarketingShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
          <PageLoader
            message={
              phase === "redirecting"
                ? "Redirecting to secure checkout…"
                : "Preparing checkout…"
            }
          />
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <div className="mx-auto max-w-lg px-4 py-14">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        {phase === "error" ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900 shadow-sm">
            <p className="font-bold">Checkout could not start</p>
            <p className="mt-2 leading-relaxed">{error}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/courses")}>
                Browse catalog
              </Button>
              <Button type="button" onClick={() => router.refresh()}>
                Try again
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "pick" ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="h-5 w-5" />
              <h1 className="font-display text-xl font-extrabold text-slate-900">
                Choose a course to upgrade
              </h1>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              More than one paid track is available. Pick which course this payment should unlock —
              you will be sent to the real checkout page (Stripe or demo) next.
            </p>
            <ul className="mt-6 space-y-3">
              {premiumCourses.map((course) => {
                const session = getSession();
                const token = session?.token;
                return (
                  <li key={course.id}>
                    <button
                      type="button"
                      disabled={!token || busyCourseId !== null}
                      onClick={() => {
                        if (!token) return;
                        void beginCheckout(token, course.id);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:border-indigo-300 hover:bg-indigo-50/60 disabled:opacity-50"
                    >
                      <span className="min-w-0 truncate">{course.title}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white">
                        <CreditCard className="h-3.5 w-3.5" />
                        {busyCourseId === course.id ? "…" : "Pay"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </MarketingShell>
  );
}
