import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Zap, Shield, HeartHandshake } from "lucide-react";
import { MarketingShell } from "@/components/marketing/page-shell";
import { PRICING_PLANS } from "@/lib/marketing/pricing";
import { FAQS } from "@/lib/marketing/faq";
import { SITE_URL } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Pricing — simple, per-course, no subscriptions",
  description:
    "Place2Prepare uses a transparent per-course Premium upgrade instead of a subscription. Basic access is free forever.",
  alternates: { canonical: `${SITE_URL}/pricing` },
};

function formatPrice(plan: (typeof PRICING_PLANS)[number]) {
  if (plan.priceInr === null) return "Let's talk";
  if (plan.priceInr === 0) return "Free";
  return `₹${plan.priceInr.toLocaleString("en-IN")}`;
}

const TRUST_BADGES = [
  { icon: Zap, label: "Instant access", sub: "Start learning right away" },
  { icon: Shield, label: "No hidden fees", sub: "Pay once, own forever" },
  { icon: HeartHandshake, label: "Downgrade anytime", sub: "No lock-in, ever" },
];

export default function PricingPage() {
  const billingFaqs = FAQS.filter((f) => f.category === "Billing");

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient px-4 py-20 text-white md:px-6 md:py-24">
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Pricing
          </div>
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Honest pricing.
            <br />
            No renewal traps.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Pay once per course when you&apos;re ready to go Premium. No monthly
            billing, no surprise charges, and you can always downgrade from
            the billing page.
          </p>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm"
              >
                <badge.icon className="h-4 w-4 text-emerald-300" />
                <div className="text-left">
                  <p className="text-xs font-bold">{badge.label}</p>
                  <p className="text-[10px] text-white/70">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="relative bg-slate-50 px-4 py-20 md:px-6">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative mx-auto max-w-[1200px]">
          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => {
              const isHighlight = Boolean(plan.highlight);
              const isExternal = plan.ctaHref.startsWith("mailto:");
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border transition hover:-translate-y-1 ${
                    isHighlight
                      ? "border-indigo-300 bg-white shadow-glow ring-2 ring-indigo-200/60"
                      : "border-slate-200 bg-white shadow-card hover:shadow-card-hover"
                  }`}
                >
                  {/* Top accent */}
                  {isHighlight && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    {isHighlight ? (
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white shadow">
                        <Sparkles className="h-3.5 w-3.5" />
                        Most popular
                      </span>
                    ) : (
                      <div className="mb-3 h-7" />
                    )}

                    <h2 className="text-xl font-extrabold text-slate-900">
                      {plan.name}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">{plan.tagline}</p>

                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {formatPrice(plan)}
                      </span>
                      {plan.priceSuffix && (
                        <span className="text-sm text-slate-500">
                          {plan.priceSuffix}
                        </span>
                      )}
                    </div>

                    <ul className="mt-7 flex-1 space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                            <Check className="h-3 w-3 text-indigo-600" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.note && (
                      <p className="mt-6 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
                        {plan.note}
                      </p>
                    )}

                    {isExternal ? (
                      <a
                        href={plan.ctaHref}
                        className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition active:scale-[0.98] ${
                          isHighlight
                            ? "bg-brand-gradient text-white shadow-glow-sm hover:brightness-110"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {plan.ctaLabel}
                      </a>
                    ) : (
                      <Link
                        href={plan.ctaHref}
                        className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold transition active:scale-[0.98] ${
                          isHighlight
                            ? "bg-brand-gradient text-white shadow-glow-sm hover:brightness-110"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {plan.ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-4 py-20 md:px-6">
        <div className="mx-auto max-w-[860px]">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Billing questions we hear a lot
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {billingFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition open:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-indigo-50 group-open:text-indigo-600">
                    +
                  </span>
                </summary>
                <p className="border-t border-slate-100 px-6 py-4 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Still unsure? See the{" "}
            <Link
              href="/faq"
              className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
            >
              full FAQ
            </Link>{" "}
            or write to{" "}
            <a
              href="mailto:hello@place2prepare.com"
              className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
            >
              hello@place2prepare.com
            </a>
            .
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
