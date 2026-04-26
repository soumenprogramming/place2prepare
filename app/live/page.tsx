"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Lock,
  Radio,
  UserCircle,
  Video,
  XCircle,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import {
  getLiveSessionCalendar,
  type LiveSession,
  type LiveSessionCalendar,
} from "@/lib/api/live-sessions";
import { clearSession, getSession, homePathForRole } from "@/lib/auth/session";

type LoadState = "checking" | "loading" | "ready" | "error";

function formatWhen(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return scheduledAt;
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusStyles(status: LiveSession["status"]) {
  switch (status) {
    case "LIVE":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "COMPLETED":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "CANCELLED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
  }
}

function SessionCard({
  session,
  archived,
}: {
  session: LiveSession;
  archived: boolean;
}) {
  const locked = !!session.accessReason;
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition ${
        archived
          ? "border-slate-200 bg-slate-50/60"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {session.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles(
                session.status
              )}`}
            >
              {session.status === "LIVE" ? (
                <Radio className="h-3 w-3" />
              ) : session.status === "COMPLETED" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : session.status === "CANCELLED" ? (
                <XCircle className="h-3 w-3" />
              ) : null}
              {session.status.toLowerCase()}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatWhen(session.scheduledAt)}
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
        </div>
        {session.courseTitle ? (
          <Link
            href={`/courses/${session.courseId}`}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            {session.courseTitle}
          </Link>
        ) : (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
            Community
          </span>
        )}
      </div>

      {session.description ? (
        <p className="mt-3 text-sm text-slate-600">{session.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
            <Lock className="h-3.5 w-3.5" />
            {session.accessReason}
          </span>
        ) : archived ? (
          <span className="text-xs font-semibold text-slate-500">
            Session has ended
          </span>
        ) : session.joinable && session.joinUrl ? (
          <a
            href={session.joinUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            <Video className="h-4 w-4" />
            Join now
          </a>
        ) : (
          <span className="text-xs font-semibold text-slate-500">
            Join button opens 15 min before the session
          </span>
        )}
      </div>
    </article>
  );
}

export default function LiveCalendarPage() {
  const router = useRouter();
  const [calendar, setCalendar] = useState<LiveSessionCalendar | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setLoadState("loading");
    getLiveSessionCalendar(session.token)
      .then((response) => {
        setCalendar(response);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        const status =
          error && typeof error === "object" && "status" in error
            ? Number((error as { status?: number }).status)
            : undefined;
        if (status === 401 || status === 403) {
          clearSession();
          router.replace("/login");
          return;
        }
        setErrorMessage(
          extractErrorMessage(error, "Unable to load live sessions.")
        );
        setLoadState("error");
      });
  }, [router]);

  const upcoming = useMemo(() => calendar?.upcoming ?? [], [calendar]);
  const past = useMemo(() => calendar?.past ?? [], [calendar]);

  if (loadState === "checking" || loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center app-shell-bg text-sm text-slate-500">
        Loading your live calendar...
      </main>
    );
  }

  const role = getSession()?.role ?? "STUDENT";

  return (
    <main className="min-h-screen app-shell-bg p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href={homePathForRole(role)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <header className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft md:p-8">
          <Image
            src="/hero-study-session.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-45"
            aria-hidden
          />
          <div className="absolute inset-0 page-hero-overlay" />
          <div className="relative">
            <p className="text-sm text-white/85">Live classroom</p>
            <h1 className="mt-1 text-3xl font-bold">Live sessions</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90">
              Mentor-led doubt clearing, mock interviews, and community Q&amp;A.
              Sessions linked to courses you&apos;re enrolled in will show a join
              button 15 minutes before start time.
            </p>
          </div>
        </header>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`rounded-full px-4 py-1.5 font-semibold transition ${
              tab === "upcoming"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            className={`rounded-full px-4 py-1.5 font-semibold transition ${
              tab === "past"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Past ({past.length})
          </button>
        </div>

        <section className="mt-5 space-y-4">
          {tab === "upcoming" ? (
            upcoming.length > 0 ? (
              upcoming.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  archived={false}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No upcoming sessions right now.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Keep an eye on this page — new sessions are scheduled every
                  week.
                </p>
              </div>
            )
          ) : past.length > 0 ? (
            past.map((session) => (
              <SessionCard key={session.id} session={session} archived />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Your past sessions will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
