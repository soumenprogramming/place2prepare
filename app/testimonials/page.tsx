import type { Metadata } from "next";
import Link from "next/link";
import { Quote } from "lucide-react";
import { MarketingShell } from "@/components/marketing/page-shell";
import { TESTIMONIALS } from "@/lib/marketing/testimonials";
import { SITE_URL } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Testimonials — results our students talk about",
  description:
    "Stories from engineering students who used Place2Prepare to clear technical and behavioural rounds at product companies.",
  alternates: { canonical: `${SITE_URL}/testimonials` },
};

export default function TestimonialsPage() {
  return (
    <MarketingShell>
      <section className="bg-brand-gradient px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Testimonials
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold md:text-5xl">
            What our learners tell us after the offer letter arrives.
          </h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Every quote below is from a real Place2Prepare learner who gave us
            permission to share. We don&apos;t pay for reviews and we don&apos;t run
            fake ones.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14 md:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote
                className="h-6 w-6 text-primary/60"
                aria-hidden
              />
              <blockquote className="mt-3 flex-1 text-slate-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white"
                  aria-hidden
                >
                  {t.avatarInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.company} · <span className="text-primary">{t.track}</span>
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Want to write the next testimonial?
          </h2>
          <p className="mt-3 text-slate-600">
            Create a free account and start a track today. It takes less than a
            minute.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
          >
            Get started for free
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
