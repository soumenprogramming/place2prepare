import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Target, Users } from "lucide-react";
import { MarketingShell } from "@/components/marketing/page-shell";
import { SITE_NAME, SITE_URL } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "About — why Place2Prepare exists",
  description: `${SITE_NAME} is a learning platform for engineering students that turns placement preparation into a focused, mentor-led routine.`,
  alternates: { canonical: `${SITE_URL}/about` },
};

const VALUES = [
  {
    icon: Target,
    title: "Honest over hype",
    body: "Placement content is full of survivor bias. We teach what actually compounds over months, not what trends on LinkedIn.",
  },
  {
    icon: Users,
    title: "Mentors who still code",
    body: "Every mentor on Place2Prepare is a practising engineer. They review your work the way their reviewers review theirs.",
  },
  {
    icon: Heart,
    title: "Built for your bad days",
    body: "Interview prep has rough weeks. Our tracking, reminders, and habit design exist so a bad week doesn't become a bad year.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="bg-brand-gradient px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            About us
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold md:text-5xl">
            We help engineering students get placed — without burning out.
          </h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Place2Prepare started as a study group between a few SDE-2s who
            were tired of watching juniors waste months on wrong advice. It is
            now a structured platform that turns that same mentoring into a
            daily, repeatable routine.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Our story</h2>
            <p className="mt-4 text-slate-600">
              We built Place2Prepare because we kept seeing the same pattern:
              brilliant students, confused roadmaps, and a marketplace of
              courses optimised for sales rather than outcomes.
            </p>
            <p className="mt-3 text-slate-600">
              So we packaged the checklists, drills, and mock interview rubrics
              we were already using with our mentees. What started as an
              internal Notion doc is now the platform you&apos;re looking at.
            </p>
            <p className="mt-3 text-slate-600">
              We are deliberately small. We would rather help 500 students do
              this seriously than 50,000 half-heartedly.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-8 text-white shadow-soft">
            <p className="text-4xl font-extrabold">87%</p>
            <p className="mt-1 text-white/80">
              of Premium learners clear at least one technical round at a
              target company within 90 days.
            </p>
            <hr className="my-6 border-white/20" />
            <p className="text-4xl font-extrabold">12</p>
            <p className="mt-1 text-white/80">
              mock interviews is the median our successful candidates do before
              their first offer.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-[1100px] px-4 md:px-6">
          <h2 className="text-2xl font-bold text-slate-900">What we stand for</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <v.icon className="h-6 w-6 text-primary" />
                <p className="mt-4 text-lg font-semibold text-slate-900">
                  {v.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-16 md:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Want to chat with the team?
          </h2>
          <p className="mt-3 text-slate-600">
            Whether you&apos;re a student with questions or a campus looking to
            partner with us, we&apos;d love to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow"
            >
              Create a free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:hello@place2prepare.com"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              hello@place2prepare.com
            </a>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
