"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  CreditCard,
  Lock,
  PlayCircle,
  Radio,
  Sparkles,
  Timer,
  Trophy,
  Unlock,
  UserCircle,
  Video,
} from "lucide-react";
import { ApiError, extractErrorMessage } from "@/lib/api/client";
import {
  canActAsLearner,
  clearSession,
  dashboardPathForRole,
  getSession,
  type UserRole,
} from "@/lib/auth/session";
import {
  enrollInCourse,
  getCourseAccess,
  type CourseAccessResponse,
  type CourseAccessState,
} from "@/lib/api/learn";
import { getLessons, type LessonList } from "@/lib/api/lessons";
import { getCourseQuizzes, type QuizListResponse } from "@/lib/api/quizzes";
import {
  getCourseLiveSessions,
  type LiveSession,
} from "@/lib/api/live-sessions";
import { PageLoader } from "@/components/ui/page-loader";
import { startCheckout } from "@/lib/api/payments";

type LoadState = "checking" | "loading" | "ready" | "error";

function DifficultyBadge({ level }: { level: string }) {
  const normalized = (level || "").toUpperCase();
  const palette: Record<string, string> = {
    BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INTERMEDIATE: "bg-sky-50 text-sky-700 border-sky-200",
    ADVANCED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        palette[normalized] ?? "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {normalized || "GENERAL"}
    </span>
  );
}

function AccessBanner({ state }: { state: CourseAccessState }) {
  const descriptor: Record<CourseAccessState, { label: string; className: string; icon: React.ReactNode }> = {
    ALLOWED: {
      label: "Enrolled",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: <Unlock className="h-3.5 w-3.5" />,
    },
    NOT_ENROLLED: {
      label: "Locked",
      className: "border-slate-200 bg-slate-50 text-slate-700",
      icon: <Lock className="h-3.5 w-3.5" />,
    },
    PLAN_REQUIRED: {
      label: "Premium only",
      className: "border-amber-200 bg-amber-50 text-amber-800",
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    INACTIVE: {
      label: "Unavailable",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: <Lock className="h-3.5 w-3.5" />,
    },
  };
  const item = descriptor[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${item.className}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId;

  const [detail, setDetail] = useState<CourseAccessResponse | null>(null);
  const [lessons, setLessons] = useState<LessonList | null>(null);
  const [quizzes, setQuizzes] = useState<QuizListResponse | null>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSession[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const loadCourseExtras = useCallback(
    async (token: string, cid: string, response: CourseAccessResponse) => {
      if (response.accessState !== "ALLOWED") {
        setLessons(null);
        setQuizzes(null);
        setLiveSessions(null);
        return;
      }
      try {
        const lessonData = await getLessons(token, cid);
        setLessons(lessonData);
      } catch {
        setLessons(null);
      }
      try {
        const quizData = await getCourseQuizzes(token, cid);
        setQuizzes(quizData);
      } catch {
        setQuizzes(null);
      }
      try {
        const liveData = await getCourseLiveSessions(Number(cid), token);
        setLiveSessions(liveData);
      } catch {
        setLiveSessions(null);
      }
    },
    []
  );

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/courses/${courseId ?? ""}`)}`
      );
      return;
    }
    setRole(session.role);
    setSessionToken(session.token);

    if (!courseId) {
      setErrorMessage("Course not found.");
      setLoadState("error");
      return;
    }

    setLoadState("loading");
    getCourseAccess(session.token, courseId)
      .then(async (response) => {
        setDetail(response);
        await loadCourseExtras(session.token, courseId, response);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        const status =
          error && typeof error === "object" && "status" in error
            ? Number((error as { status?: number }).status)
            : undefined;
        if (status === 401) {
          clearSession();
          router.replace(
            `/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`
          );
          return;
        }
        setErrorMessage(
          extractErrorMessage(error, "Unable to load this course right now.")
        );
        setLoadState("error");
      });
  }, [courseId, router, loadCourseExtras]);

  if (loadState === "checking" || loadState === "loading") {
    return <PageLoader message="Loading course…" />;
  }

  const dashboardHref = dashboardPathForRole(role);

  if (loadState === "error" || !detail) {
    return (
      <main className="min-h-screen app-shell-bg p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {errorMessage || "This course could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  const { course, accessState, reason, planType } = detail;
  const accountPremium = detail.accountPremium ?? false;
  const isAllowed = accessState === "ALLOWED";
  const planUpper = (planType ?? "").toUpperCase();
  const showPremiumCheckout =
    !!sessionToken &&
    canActAsLearner(role) &&
    course.premium &&
    !accountPremium &&
    (accessState === "NOT_ENROLLED" || accessState === "PLAN_REQUIRED") &&
    (!planType || planUpper === "BASIC");

  async function handleUpgrade() {
    if (!sessionToken || !courseId) return;
    setUpgrading(true);
    setUpgradeError("");
    try {
      const response = await startCheckout(sessionToken, Number(courseId));
      const url = (response.checkoutUrl ?? "").trim();
      if (!url) {
        setUpgradeError(
          "Checkout did not return a payment URL. Check Billing for a pending order or contact support."
        );
        setUpgrading(false);
        return;
      }
      window.location.assign(url);
    } catch (error) {
      setUpgradeError(
        extractErrorMessage(error, "Couldn't start checkout right now.")
      );
      setUpgrading(false);
    }
  }

  async function handleSelfEnroll() {
    if (!sessionToken || !courseId) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      const res = await enrollInCourse(sessionToken, courseId);
      setDetail(res);
      await loadCourseExtras(sessionToken, courseId, res);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          const refreshed = await getCourseAccess(sessionToken, courseId);
          setDetail(refreshed);
          await loadCourseExtras(sessionToken, courseId, refreshed);
        } catch (inner) {
          setEnrollError(
            extractErrorMessage(inner, "Could not refresh course access.")
          );
        }
      } else {
        setEnrollError(
          extractErrorMessage(error, "Could not enroll right now.")
        );
      }
    } finally {
      setEnrolling(false);
    }
  }

  const progressValue = lessons ? lessons.progressPercentage : detail.progress ?? 0;
  const lessonsLeftValue = lessons
    ? lessons.totalLessons - lessons.completedLessons
    : detail.lessonsLeft ?? 0;
  const nextLesson = lessons?.lessons.find((item) => !item.completed) ?? lessons?.lessons[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f6fb] p-4 md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-15%,rgba(99,102,241,0.07),transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
          <Link
            href={dashboardHref}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Dashboard
          </Link>
        </div>

        <header className="mt-5 rounded-[1.75rem] border border-white/15 bg-brand-gradient p-6 text-white shadow-[0_28px_60px_-24px_rgba(79,70,229,0.45)] md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 font-semibold uppercase tracking-wide">
              {course.subject}
            </span>
            {course.premium ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100/90 px-2 py-0.5 font-semibold uppercase tracking-wide text-amber-900">
                <Sparkles className="h-3 w-3" />
                Premium
              </span>
            ) : null}
            <AccessBanner state={accessState} />
          </div>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{course.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/90 md:text-base">
            {course.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/90">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {course.durationHours} hours of content
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              Difficulty: {course.difficulty}
            </span>
            {(planType || (course.premium && accountPremium)) ? (
              <span className="inline-flex items-center gap-1">
                <Unlock className="h-3.5 w-3.5" />
                Your plan:{" "}
                {course.premium && accountPremium ? "PREMIUM (membership)" : planType}
              </span>
            ) : null}
          </div>
        </header>

        {showPremiumCheckout ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-indigo-50 p-5 shadow-sm">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {accessState === "NOT_ENROLLED" ? "Purchase Premium" : "Upgrade to Premium"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {accessState === "NOT_ENROLLED"
                  ? "Checkout enrolls you in this course and unlocks lessons, quizzes, and live sessions. One-time payment on this account."
                  : "Unlock premium lessons, quizzes, and live sessions for this course. One-time payment, lifetime access on this account."}
              </p>
              {upgradeError ? (
                <p className="mt-2 text-xs text-rose-600">{upgradeError}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/billing"
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Billing
              </Link>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {upgrading ? "Starting checkout..." : accessState === "NOT_ENROLLED" ? "Buy Premium" : "Upgrade now"}
              </button>
            </div>
          </div>
        ) : null}

        {isAllowed ? (
          <section className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Your progress</h2>
                <span className="text-xs font-semibold text-slate-500">
                  {progressValue}% complete
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-brand-gradient shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                  style={{
                    width: `${Math.min(100, Math.max(0, progressValue))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {lessons
                  ? `${lessons.completedLessons} of ${lessons.totalLessons} lessons completed`
                  : `${lessonsLeftValue} lessons remaining`}
              </p>

              {nextLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                >
                  <PlayCircle className="h-4 w-4" />
                  {lessons && lessons.completedLessons > 0
                    ? "Resume learning"
                    : "Start learning"}
                </Link>
              ) : null}

              <div className="mt-6">
                <h3 className="text-base font-bold text-slate-900">Lessons</h3>
                {lessons && lessons.lessons.length > 0 ? (
                  <ol className="mt-3 space-y-2">
                    {lessons.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="h-5 w-5 flex-shrink-0 text-slate-300" />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                                {lesson.position}. {lesson.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {lesson.durationMinutes} min
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-600">
                    <p className="font-semibold text-slate-700">
                      Lessons are being prepared
                    </p>
                    <p className="mt-1 text-slate-500">
                      You have access to this course. Lesson content will appear
                      here as soon as the learning team publishes the first
                      lesson.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">What you get</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Structured roadmap aligned with placements
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Topic-wise practice with explanations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Live doubt sessions and mentorship
                </li>
                {course.premium ? (
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" />
                    Premium: mock interviews and personal feedback
                  </li>
                ) : null}
              </ul>
            </aside>
          </section>
        ) : null}

        {isAllowed && quizzes && quizzes.quizzes.length > 0 ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Practice tests
                  </h2>
                  <p className="text-xs text-slate-500">
                    Time-boxed quizzes with per-question explanations to cement
                    what you learned.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                {quizzes.totalQuizzes} available
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {quizzes.quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/courses/${course.id}/quizzes/${quiz.id}`}
                  className="group flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                      {quiz.title}
                    </h3>
                    {quiz.bestScorePercent != null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Trophy className="h-3 w-3" />
                        Best {quiz.bestScorePercent}%
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        Not attempted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {quiz.description}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {quiz.timeLimitMinutes} min
                    </span>
                    <span>{quiz.questionCount} questions</span>
                    <span>Pass {quiz.passingScorePercent}%</span>
                    {quiz.attemptCount > 0 ? (
                      <span>
                        {quiz.attemptCount} attempt
                        {quiz.attemptCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                      {quiz.inProgressAttemptId
                        ? "Resume attempt"
                        : quiz.attemptCount > 0
                          ? "Retake"
                          : "Start attempt"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {isAllowed && liveSessions && liveSessions.length > 0 ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Live sessions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Scheduled mentor sessions just for learners in this course.
                  </p>
                </div>
              </div>
              <Link
                href="/live"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Full calendar
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {liveSessions.map((session) => {
                const when = new Date(session.scheduledAt);
                const whenLabel = Number.isNaN(when.getTime())
                  ? session.scheduledAt
                  : when.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                const isPast =
                  session.status === "COMPLETED" ||
                  session.status === "CANCELLED" ||
                  when.getTime() + session.durationMinutes * 60 * 1000 <
                    Date.now();
                return (
                  <li
                    key={session.id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {session.title}
                          </p>
                          {session.status === "LIVE" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
                              <Radio className="h-3 w-3" /> live
                            </span>
                          ) : session.status === "CANCELLED" ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                              cancelled
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {whenLabel}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {session.durationMinutes} min
                          </span>
                          {session.instructorName ? (
                            <span className="inline-flex items-center gap-1">
                              <UserCircle className="h-3.5 w-3.5" />
                              {session.instructorName}
                            </span>
                          ) : null}
                        </div>
                        {session.description ? (
                          <p className="mt-2 text-xs text-slate-600">
                            {session.description}
                          </p>
                        ) : null}
                      </div>
                      {session.joinable && session.joinUrl ? (
                        <a
                          href={session.joinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Join
                        </a>
                      ) : isPast ? (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Ended
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">
                          Opens 15 min before
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {!isAllowed ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                {accessState === "PLAN_REQUIRED" ? (
                  <Sparkles className="h-5 w-5 text-amber-500" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  {accessState === "PLAN_REQUIRED"
                    ? "Upgrade needed to unlock this course"
                    : accessState === "INACTIVE"
                      ? "Course currently unavailable"
                      : accessState === "NOT_ENROLLED" && course.premium && !accountPremium
                        ? "Premium purchase required"
                        : "You are not enrolled in this course"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {reason ??
                    "Choose how you want to access this course from the options below."}
                </p>
                {enrollError ? (
                  <p className="mt-3 text-xs text-rose-600">{enrollError}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  {canActAsLearner(role) &&
                  accessState === "NOT_ENROLLED" &&
                  (!course.premium || accountPremium) ? (
                    <button
                      type="button"
                      onClick={handleSelfEnroll}
                      disabled={enrolling}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {enrolling ? "Enrolling…" : "Enroll in this course"}
                    </button>
                  ) : null}
                  <Link
                    href="/courses"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Browse other courses
                  </Link>
                  <Link
                    href={dashboardHref}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Go to dashboard
                  </Link>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  {accessState === "NOT_ENROLLED" && canActAsLearner(role) && !course.premium ? (
                    <>
                      <span className="font-semibold text-slate-700">Computer Networks</span> and{" "}
                      <span className="font-semibold text-slate-700">DBMS</span> are free on Basic — tap Enroll
                      above. For other tracks, purchase Premium once, then you can self-enroll from each course
                      page.
                    </>
                  ) : accessState === "NOT_ENROLLED" && canActAsLearner(role) && course.premium && accountPremium ? (
                    <>
                      Your Premium membership is active. Tap{" "}
                      <span className="font-semibold text-slate-700">Enroll in this course</span> above to add{" "}
                      <span className="font-semibold text-slate-700">{course.title}</span>.
                    </>
                  ) : accessState === "NOT_ENROLLED" && canActAsLearner(role) && course.premium && !accountPremium ? (
                    <>
                      Buy Premium once from the banner above (checkout enrolls you in this course). After that you
                      can self-enroll other paid courses from the catalog.{" "}
                      <span className="font-semibold text-slate-700">Computer Networks</span> and{" "}
                      <span className="font-semibold text-slate-700">DBMS</span> stay free to enroll anytime.
                    </>
                  ) : accessState === "PLAN_REQUIRED" ? (
                    <>
                      You are enrolled on Basic. Use{" "}
                      <span className="font-semibold text-slate-700">
                        Upgrade now
                      </span>{" "}
                      or Billing to unlock{" "}
                      <span className="font-semibold text-slate-700">
                        {course.title}
                      </span>
                      .
                    </>
                  ) : accessState === "INACTIVE" ? (
                    "This course is not accepting enrollments right now."
                  ) : (
                    "Sign in to self-enroll from the catalog."
                  )}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
