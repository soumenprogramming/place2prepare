"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { logoutUser } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import NotificationBell from "@/components/notifications/notification-bell";
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
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const normalized = plan?.toUpperCase() ?? "BASIC";
  const isPremium = normalized === "PREMIUM";
  const styles = isPremium
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles}`}
    >
      {isPremium ? <Sparkles className="h-3 w-3" /> : null}
      {normalized}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() ?? "ACTIVE";
  const palette: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PAUSED: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm text-slate-500">
        Loading your dashboard...
      </main>
    );
  }

  const enrolledCourses: EnrolledCourse[] = dashboardData?.activeCourses ?? [];
  const upcomingItems = dashboardData?.upcomingSchedule ?? [];
  const activityItems = dashboardData?.recentActivity ?? [];
  const hasPremium = enrolledCourses.some(
    (course) => (course.planType ?? "").toUpperCase() === "PREMIUM"
  );

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-5 rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/85">
                Welcome back, {dashboardData?.fullName ?? "Learner"}
              </p>
              <h1 className="mt-1 text-3xl font-bold">Student Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/90">
                Track your placement preparation, complete your courses, and
                stay ready for upcoming interviews.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                hasPremium
                  ? "border-amber-200 bg-amber-100/90 text-amber-900"
                  : "border-white/40 bg-white/15 text-white"
              }`}
            >
              {hasPremium ? <Sparkles className="h-3.5 w-3.5" /> : null}
              {hasPremium ? "Premium learner" : "Basic learner"}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700"
            >
              Explore courses
            </Link>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              <Video className="h-4 w-4" />
              Live sessions
            </Link>
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
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
              className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white/95 transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        {errorMessage ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Learning Streak"
            value={`${dashboardData?.stats.learningStreakDays ?? 0} Days`}
            subtitle="Keep momentum for badge rewards"
            icon={<Trophy className="h-4 w-4" />}
          />
          <StatCard
            title="Courses Enrolled"
            value={`${dashboardData?.stats.enrolledCourses ?? 0}`}
            subtitle={`${enrolledCourses.length} currently active`}
            icon={<BookOpen className="h-4 w-4" />}
          />
          <StatCard
            title="Upcoming Interviews"
            value={`${dashboardData?.stats.upcomingInterviews ?? 0}`}
            subtitle={
              upcomingItems.length > 0
                ? `Next: ${upcomingItems[0].title}`
                : "No sessions scheduled"
            }
            icon={<BriefcaseBusiness className="h-4 w-4" />}
          />
          <StatCard
            title="Weekly Learning Time"
            value={dashboardData?.stats.weeklyLearningTime ?? "0h"}
            subtitle="Target 10h / week"
            icon={<Clock3 className="h-4 w-4" />}
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">My Active Courses</h2>
              <Link
                href="/courses"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Browse catalog
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {enrolledCourses.map((course) => (
                <div
                  key={course.enrollmentId ?? course.title}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{course.title}</p>
                        <PlanBadge plan={course.planType} />
                        <StatusBadge status={course.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {course.lessonsLeft} lessons remaining
                      </p>
                    </div>
                    {course.courseId ? (
                      <Link
                        href={`/courses/${course.courseId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Continue
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-brand-gradient shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                      style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {course.progress}% completed
                  </p>
                </div>
              ))}
              {enrolledCourses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    You have no active courses yet.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    An administrator will assign your first course shortly.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Upcoming Schedule</h3>
                <Link
                  href="/live"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  View calendar
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-3"
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
                      {item.status === "LIVE" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
                          <Radio className="h-3 w-3" /> live
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {item.time} · {item.durationMinutes}m
                    </p>
                    {item.joinable && item.joinUrl ? (
                      <a
                        href={item.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join now
                      </a>
                    ) : null}
                  </div>
                ))}
                {upcomingItems.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No upcoming sessions right now.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <div className="mt-3 space-y-3">
                {activityItems.map((item, index) => (
                  <p
                    key={`${index}-${item}`}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CircleCheckBig className="mt-0.5 h-4 w-4 text-emerald-500" />
                    {item}
                  </p>
                ))}
                {activityItems.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity yet.</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
