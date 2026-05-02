"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheckBig,
  Clock3,
  CreditCard,
  Radio,
  Sparkles,
  Trophy,
  Video,
  TrendingUp,
} from "lucide-react";
import { logoutUser } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import NotificationBell from "@/components/notifications/notification-bell";
import { PageLoader } from "@/components/ui/page-loader";
import {
  clearSession,
  getSession,
  homePathForRole,
} from "@/lib/auth/session";
import {
  getDashboardOverview,
  type DashboardOverview,
  type EnrolledCourse,
} from "@/lib/api/platform";

type LoadState = "checking" | "loading" | "ready" | "error";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "indigo",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent?: "indigo" | "purple" | "emerald" | "amber";
}) {
  const accentMap = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", bar: "from-blue-500 to-indigo-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", bar: "from-indigo-500 to-purple-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "from-emerald-500 to-teal-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "from-amber-400 to-orange-500" },
  };
  const a = accentMap[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${a.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg}`}>
          <span className={a.text}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const normalized = plan?.toUpperCase() ?? "BASIC";
  const isPremium = normalized === "PREMIUM";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        isPremium
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {isPremium ? <Sparkles className="h-3 w-3" /> : null}
      {normalized}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() ?? "ACTIVE";
  const palette: Record<string, string> = {
    ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PAUSED: "border-amber-200 bg-amber-50 text-amber-700",
    COMPLETED: "border-indigo-200 bg-indigo-50 text-indigo-700",
    CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        palette[normalized] ?? palette.ACTIVE
      }`}
    >
      {normalized}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [sessionToken, setSessionToken] = useState<string>("");

  async function handleLogout() {
    const token = getSession()?.token;
    try {
      await logoutUser(token ?? undefined);
    } finally {
      clearSession();
      router.push("/login");
    }
  }

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role === "ADMIN") {
      router.replace(homePathForRole("ADMIN"));
      return;
    }

    setSessionToken(session.token);
    setLoadState("loading");
    getDashboardOverview(session.token)
      .then((response) => {
        setDashboardData(response);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        const message = extractErrorMessage(
          error,
          "Unable to load your dashboard right now."
        );
        const status =
          error && typeof error === "object" && "status" in error
            ? Number((error as { status?: number }).status)
            : undefined;
        if (status === 401 || status === 403) {
          clearSession();
          router.replace("/login");
          return;
        }
        setErrorMessage(message);
        setLoadState("error");
      });
  }, [router]);

  if (loadState === "checking" || loadState === "loading") {
    return <PageLoader message="Loading your dashboard…" />;
  }

  const enrolledCourses: EnrolledCourse[] = dashboardData?.activeCourses ?? [];
  const upcomingItems = dashboardData?.upcomingSchedule ?? [];
  const activityItems = dashboardData?.recentActivity ?? [];
  const hasPremium = enrolledCourses.some(
    (course) => (course.planType ?? "").toUpperCase() === "PREMIUM"
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4f6fb] p-4 md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-[1400px]">
        {/* Header */}
        <header className="relative mb-6 rounded-[1.75rem] border border-slate-800/20 bg-slate-950 p-6 text-white shadow-[0_28px_60px_-28px_rgba(15,23,42,0.35)] md:p-8">
          {/* Clip rounded corners only on the photo layer — not the whole header — so notification dropdowns are not cut off */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]">
            <Image
              src="/hero-study-session.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-45"
              aria-hidden
            />
            <div className="absolute inset-0 page-hero-overlay" />
          </div>

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/80">
                Welcome back, {dashboardData?.fullName ?? "Learner"} 👋
              </p>
              <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
                Student Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                Track your placement preparation, complete your courses, and
                stay ready for upcoming interviews.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                hasPremium
                  ? "border-amber-200 bg-amber-100/90 text-amber-900"
                  : "border-white/30 bg-white/15 text-white backdrop-blur-sm"
              }`}
            >
              {hasPremium ? <Sparkles className="h-3.5 w-3.5" /> : null}
              {hasPremium ? "Premium learner" : "Basic learner"}
            </span>
          </div>

          <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href="/courses"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              Explore courses
            </Link>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
            >
              <Video className="h-4 w-4" />
              Live sessions
            </Link>
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </Link>
            {sessionToken ? (
              <NotificationBell token={sessionToken} tone="dark" />
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
            {errorMessage}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Learning Streak"
            value={`${dashboardData?.stats.learningStreakDays ?? 0} Days`}
            subtitle="Keep momentum for badge rewards"
            icon={<Trophy className="h-5 w-5" />}
            accent="amber"
          />
          <StatCard
            title="Courses Enrolled"
            value={`${dashboardData?.stats.enrolledCourses ?? 0}`}
            subtitle={`${enrolledCourses.length} currently active`}
            icon={<BookOpen className="h-5 w-5" />}
            accent="indigo"
          />
          <StatCard
            title="Upcoming Interviews"
            value={`${dashboardData?.stats.upcomingInterviews ?? 0}`}
            subtitle={
              upcomingItems.length > 0
                ? `Next: ${upcomingItems[0].title}`
                : "No sessions scheduled"
            }
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            accent="purple"
          />
          <StatCard
            title="Weekly Learning Time"
            value={dashboardData?.stats.weeklyLearningTime ?? "0h"}
            subtitle="Target 10h / week"
            icon={<Clock3 className="h-5 w-5" />}
            accent="emerald"
          />
        </section>

        {/* Main content */}
        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          {/* Active courses */}
          <div className="rounded-[1.35rem] border border-slate-200/90 bg-white/95 p-5 shadow-card backdrop-blur-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">My Active Courses</h2>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Browse catalog <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {enrolledCourses.map((course) => (
                <div
                  key={course.enrollmentId ?? course.title}
                  className="group rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{course.title}</p>
                        <PlanBadge plan={course.planType} />
                        <StatusBadge status={course.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {course.lessonsLeft} lessons remaining
                      </p>
                    </div>
                    {course.courseId ? (
                      <Link
                        href={`/courses/${course.courseId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Continue
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-xs text-slate-500">{course.progress}% completed</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <TrendingUp className="h-3 w-3" />
                        {course.lessonsLeft} left
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {enrolledCourses.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No active courses yet.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Open the catalog: enroll in Computer Networks or DBMS anytime for free. For other courses,
                    purchase Premium once from Billing, then self-enroll from each course page.
                  </p>
                  <Link
                    href="/courses"
                    className="mt-4 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-500"
                  >
                    Browse catalog
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Upcoming schedule */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Upcoming Schedule</h3>
                <Link
                  href="/live"
                  className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  View calendar
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.title}
                        </p>
                        {item.courseTitle ? (
                          <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {item.courseTitle}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-indigo-600">
                            Community session
                          </p>
                        )}
                      </div>
                      {item.status === "LIVE" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                          <Radio className="h-3 w-3" /> live
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {item.time} · {item.durationMinutes}m
                    </p>
                    {item.joinable && item.joinUrl && (
                      <a
                        href={item.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join now
                      </a>
                    )}
                  </div>
                ))}
                {upcomingItems.length === 0 && (
                  <p className="text-sm text-slate-500">No upcoming sessions right now.</p>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <div className="mt-3 space-y-2.5">
                {activityItems.map((item, index) => (
                  <p
                    key={`${index}-${item}`}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </p>
                ))}
                {activityItems.length === 0 && (
                  <p className="text-sm text-slate-500">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
