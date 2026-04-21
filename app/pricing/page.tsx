import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
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

export default function PricingPage() {
  const billingFaqs = FAQS.filter((f) => f.category === "Billing");

  return (
    <MarketingShell>
      <section className="bg-brand-gradient px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Pricing
          </p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Honest pricing. No renewal traps.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            Pay once per course when you're ready to go Premium. No monthly
            billing, no surprise charges, and you can always downgrade from
            the billing page.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isHighlight = Boolean(plan.highlight);
            const isExternal = plan.ctaHref.startsWith("mailto:");
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition ${
                  isHighlight
                    ? "border-primary/50 bg-white shadow-md ring-2 ring-primary/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                {isHighlight ? (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most popular
                  </span>
                ) : null}
                <h2 className="text-xl font-bold text-slate-900">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {formatPrice(plan)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {plan.priceSuffix}
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.note ? (
                  <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    {plan.note}
                  </p>
                ) : null}

                {isExternal ? (
                  <a
                    href={plan.ctaHref}
                    className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isHighlight
                        ? "bg-brand-gradient text-white shadow hover:brightness-110"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {plan.ctaLabel}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isHighlight
                        ? "bg-brand-gradient text-white shadow hover:brightness-110"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {plan.ctaLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-[900px] px-4 md:px-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Billing questions we hear a lot
          </h2>
          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {billingFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group px-5 py-4 open:bg-slate-50"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Still unsure? See the{" "}
            <Link href="/faq" className="font-semibold text-primary underline-offset-2 hover:underline">
              full FAQ
            </Link>{" "}
            or write to{" "}
            <a
              href="mailto:hello@place2prepare.com"
              className="font-semibold text-primary underline-offset-2 hover:underline"
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
