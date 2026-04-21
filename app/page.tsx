import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  LineChart,
  MessagesSquare,
  PlayCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/page-shell";
import { getAllPosts } from "@/lib/blog/posts";
import { TESTIMONIALS } from "@/lib/marketing/testimonials";
import { PRICING_PLANS } from "@/lib/marketing/pricing";
import { SITE_NAME, SITE_URL } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Placement prep that actually lands offers",
  description:
    "Place2Prepare is a structured, mentor-led placement preparation platform for engineering students. Master DSA, system design, aptitude, and HR rounds with live mocks and feedback.",
  alternates: { canonical: SITE_URL },
};

const HERO_HIGHLIGHTS = [
  "Company-wise placement tracks, built with mentors who still interview",
  "Live mock interviews with written, actionable feedback",
  "DSA, System Design, Aptitude, HR, DBMS, CN — one structured home",
];

const SUBJECTS = [
  "DSA",
  "System Design",
  "Aptitude",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "HR / Behavioural",
  "Resume Review",
];

const FEATURE_BLOCKS = [
  {
    icon: GraduationCap,
    title: "Structured tracks, not random videos",
    body: "Every track is a weekly roadmap with lessons, practice, and checkpoints — so you always know what to do next.",
  },
  {
    icon: MessagesSquare,
    title: "Live mock interviews",
    body: "Book slots with real engineers. Get written feedback after every round, scoped to exactly what to fix next.",
  },
  {
    icon: LineChart,
    title: "Progress you can actually see",
    body: "Your dashboard shows lessons left, streaks, and quiz accuracy per subject — not just vanity completion bars.",
  },
  {
    icon: CreditCard,
    title: "No subscriptions, ever",
    body: "Basic is free forever. Premium is a one-time per-course upgrade. Downgrade any course whenever you like.",
  },
];

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3);
  const featuredTestimonials = TESTIMONIALS.slice(0, 3);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Placement preparation platform for engineering students covering DSA, system design, aptitude, and mock interviews.",
    sameAs: [],
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient px-4 py-16 text-white md:px-6 md:py-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <Star className="h-3.5 w-3.5" />
              Built for final-year B.Tech students
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
              Elevate your skills and get placement-ready faster.
            </h1>
            <p className="mt-4 max-w-xl text-white/85">
              Learn with structured tracks, real interview simulations, and
              mentor-led guidance designed for current hiring trends — not
              outdated playlists.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <PlayCircle className="h-4 w-4" />
                Browse courses
              </Link>
            </div>

            <div className="mt-6 space-y-2">
              {HERO_HIGHLIGHTS.map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/90"
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-white/10 p-5 text-white shadow-soft backdrop-blur">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                This week for a Premium learner
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                  <div>
                    <p className="font-semibold">
                      3 DSA lessons + 2 pattern drills
                    </p>
                    <p className="text-white/75">
                      Sliding window, monotonic stack, graphs.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  <div>
                    <p className="font-semibold">1 live mock interview</p>
                    <p className="text-white/75">
                      With written feedback within 24 hours.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-300" />
                  <div>
                    <p className="font-semibold">
                      Behavioural story workshop
                    </p>
                    <p className="text-white/75">
                      Build 5 reusable STAR stories.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-5 text-slate-800">
              <p className="text-sm font-semibold">
                Join {TESTIMONIALS.length * 300}+ students already preparing.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create a free account and let us place the next one on you.
              </p>
              <Link
                href="/register"
                className="mt-3 inline-flex rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Subjects we cover
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Every major placement subject, in one place.
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature blocks */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Why Place2Prepare
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              We optimise for offers, not watch-time.
            </h2>
            <p className="mt-3 text-slate-600">
              Everything in the platform maps back to one question: does this
              get you closer to an offer this semester?
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURE_BLOCKS.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <feature.icon className="h-6 w-6 text-primary" />
                <p className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials teaser */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Real results
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Students say it best.
              </h2>
            </div>
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              See all stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredTestimonials.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <blockquote className="text-slate-700">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
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
                      {t.role} · {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Simple pricing
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Start free. Upgrade only what you need.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Full pricing details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-primary/50 bg-white shadow-md ring-2 ring-primary/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlight ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-0.5 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </span>
                ) : null}
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {plan.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">
                  {plan.priceInr === null
                    ? "Let's talk"
                    : plan.priceInr === 0
                      ? "Free"
                      : `₹${plan.priceInr.toLocaleString("en-IN")}`}
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    {plan.priceSuffix}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog teaser */}
      {latestPosts.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  From the blog
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                  Hard-earned playbooks, written weekly.
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Read the blog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-xs text-indigo-700">
                    <BookOpen className="h-4 w-4" />
                    {post.tags[0] ?? "Article"}
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {post.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {post.description}
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    {post.author} ·{" "}
                    {new Date(post.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="bg-brand-gradient py-16 text-white">
        <div className="mx-auto max-w-[900px] px-4 text-center md:px-6">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            The first step is free. The last step is an offer letter.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/85">
            Create an account, pick a track, and let our mentors walk you
            through the rest.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg"
            >
              Create your free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
