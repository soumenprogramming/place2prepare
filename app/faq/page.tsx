import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/page-shell";
import { FAQS } from "@/lib/marketing/faq";
import { SITE_URL } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "FAQ — everything about Place2Prepare",
  description:
    "Common questions from students about accounts, courses, live sessions, billing, and more.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default function FaqPage() {
  const categories = Array.from(new Set(FAQS.map((f) => f.category)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-brand-gradient px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            FAQ
          </p>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Short answers to long emails.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Couldn't find what you needed? Email{" "}
            <a
              className="underline underline-offset-2"
              href="mailto:hello@place2prepare.com"
            >
              hello@place2prepare.com
            </a>{" "}
            and we'll reply within one working day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-16 md:px-6">
        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold text-slate-900">{category}</h2>
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {FAQS.filter((f) => f.category === category).map((faq) => (
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
          </div>
        ))}
      </section>
    </MarketingShell>
  );
}
