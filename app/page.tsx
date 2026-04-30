import type { Metadata } from "next";
import Image from "next/image";
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
  Zap,
  Users,
  TrendingUp,
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
  { label: "DSA", color: "from-blue-500 to-indigo-500" },
  { label: "System Design", color: "from-indigo-500 to-purple-500" },
  { label: "Aptitude", color: "from-purple-500 to-pink-500" },
  { label: "Operating Systems", color: "from-pink-500 to-rose-500" },
  { label: "DBMS", color: "from-orange-500 to-amber-500" },
  { label: "Computer Networks", color: "from-teal-500 to-cyan-500" },
  { label: "HR / Behavioural", color: "from-emerald-500 to-green-500" },
  { label: "Resume Review", color: "from-sky-500 to-blue-500" },
];

const FEATURE_BLOCKS = [
  {
    icon: GraduationCap,
    title: "Structured tracks, not random videos",
    body: "Every track is a weekly roadmap with lessons, practice, and checkpoints — so you always know what to do next.",
    accent: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: MessagesSquare,
    title: "Live mock interviews",
    body: "Book slots with real engineers. Get written feedback after every round, scoped to exactly what to fix next.",
    accent: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: LineChart,
    title: "Progress you can actually see",
    body: "Your dashboard shows lessons left, streaks, and quiz accuracy per subject — not just vanity completion bars.",
    accent: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: CreditCard,
    title: "No subscriptions, ever",
    body: "Basic is free forever. Premium is a one-time per-course upgrade. Downgrade any course whenever you like.",
    accent: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const STATS = [
  { value: `${TESTIMONIALS.length * 300}+`, label: "Students enrolled", icon: Users },
  { value: "50+", label: "Expert-led courses", icon: BookOpen },
  { value: "95%", label: "Placement success rate", icon: TrendingUp },
  { value: "4.9★", label: "Average rating", icon: Star },
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

      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/hero-study-session.png"
          alt="Students preparing for placement interviews in a modern study room"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.76)_44%,rgba(15,23,42,0.28)_100%)]" />

        <div className="relative mx-auto flex min-h-[78svh] max-w-[1200px] flex-col justify-center px-4 py-16 md:px-6 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              From beginner to job-ready — all in one place.
            </div>
            <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.06] tracking-tight md:text-6xl">
              Placement preparation with a real interview room feel.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/82 md:text-lg">
              Follow guided tracks, solve focused practice sets, attend live
              mentor sessions, and walk into interviews with a sharper plan.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
              >
                Create your free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-white/28 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/18 active:scale-[0.98]"
              >
                <PlayCircle className="h-4 w-4" />
                Browse courses
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {HERO_HIGHLIGHTS.map((item) => (
                <p
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-white/[0.14] bg-white/[0.08] p-3 text-sm text-white/[0.86] backdrop-blur-md"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <stat.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Subjects we cover
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Every major placement subject,{" "}
              <span className="gradient-text">in one place.</span>
            </h2>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {SUBJECTS.map((subject) => (
              <span
                key={subject.label}
                className="group relative overflow-hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <span className={`absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 transition group-hover:opacity-8`} />
                {subject.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature blocks ── */}
      <section className="relative overflow-hidden bg-slate-50 py-20">
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Why Place2Prepare
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              We optimise for{" "}
              <span className="gradient-text">offers, not watch-time.</span>
            </h2>
            <p className="mt-3 text-slate-600">
              Everything in the platform maps back to one question: does this
              get you closer to an offer this semester?
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURE_BLOCKS.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                {/* Top accent line */}
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${feature.accent}`} />
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <p className="mt-4 text-base font-bold text-slate-900">
                  {feature.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Real results
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Students say it best.
              </h2>
            </div>
            <Link
              href="/testimonials"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              See all stories{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featuredTestimonials.map((t, i) => (
              <figure
                key={t.name}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                {/* Quote mark */}
                <span className="absolute right-5 top-4 text-5xl font-serif leading-none text-indigo-100 select-none">
                  &ldquo;
                </span>
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="relative mt-3 text-sm leading-relaxed text-slate-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-glow-sm"
                    aria-hidden
                  >
                    {t.avatarInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
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

      {/* ── Pricing teaser ── */}
      <section className="relative overflow-hidden bg-slate-50 py-20">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Simple pricing
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Start free. Upgrade only what you need.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Full pricing details{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-0.5 ${
                  plan.highlight
                    ? "border-indigo-300 bg-white shadow-glow ring-2 ring-indigo-200/60"
                    : "border-slate-200 bg-white shadow-card hover:shadow-card-hover"
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" />
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                      <Sparkles className="h-3 w-3" /> Popular
                    </span>
                  </>
                )}
                <p className="text-lg font-bold text-slate-900">{plan.name}</p>
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

      {/* ── Blog teaser ── */}
      {latestPosts.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  From the blog
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Hard-earned playbooks, written weekly.
                </h2>
              </div>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Read the blog{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-card-hover"
                >
                  <div className="flex-1 p-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      <BookOpen className="h-3.5 w-3.5" />
                      {post.tags[0] ?? "Article"}
                    </div>
                    <p className="mt-3 text-base font-bold leading-snug text-slate-900 transition group-hover:text-indigo-700">
                      {post.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                    <p className="text-xs text-slate-500">
                      {post.author} ·{" "}
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-brand-gradient py-20 text-white">
        <div className="absolute inset-0 bg-hero-mesh opacity-50" />
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-fuchsia-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-[900px] px-4 text-center md:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Join {TESTIMONIALS.length * 300}+ students already preparing
          </div>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight md:text-5xl">
            The first step is free.
            <br />
            The last step is an offer letter.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85">
            Create an account, pick a track, and let our mentors walk you
            through the rest.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              Create your free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
