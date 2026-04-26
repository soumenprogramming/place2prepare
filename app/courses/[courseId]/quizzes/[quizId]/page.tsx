"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock3,
  History,
  ListChecks,
  PlayCircle,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";
import {
  getCourseQuizzes,
  getQuizHistory,
  startQuizAttempt,
  type AttemptHistoryItem,
  type QuizSummary,
} from "@/lib/api/quizzes";

type LoadState = "checking" | "loading" | "ready" | "error";

function formatDate(value: string | null): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function QuizIntroPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string; quizId: string }>();
  const courseId = params?.courseId;
  const quizId = params?.quizId;

  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          `/courses/${courseId ?? ""}/quizzes/${quizId ?? ""}`
        )}`
      );
      return;
    }
    if (!courseId || !quizId) {
      setErrorMessage("Quiz not found.");
      setLoadState("error");
      return;
    }
    const numericQuizId = Number(quizId);
    setLoadState("loading");

    Promise.all([
      getCourseQuizzes(session.token, courseId),
      getQuizHistory(session.token, courseId, quizId),
    ])
      .then(([list, attempts]) => {
        const match = list.quizzes.find((q) => q.id === numericQuizId) ?? null;
        setQuiz(match);
        setCourseTitle(list.courseTitle);
        setHistory(attempts);
        if (!match) {
          setErrorMessage("Quiz not found in this course.");
          setLoadState("error");
        } else {
          setLoadState("ready");
        }
      })
      .catch((error: unknown) => {
        const status =
          error && typeof error === "object" && "status" in error
            ? Number((error as { status?: number }).status)
            : undefined;
        if (status === 401) {
          clearSession();
          router.replace(
            `/login?redirect=${encodeURIComponent(
              `/courses/${courseId}/quizzes/${quizId}`
            )}`
          );
          return;
        }
        if (status === 403) {
          router.replace(`/courses/${courseId}`);
          return;
        }
        setErrorMessage(
          extractErrorMessage(error, "Unable to load this quiz right now.")
        );
        setLoadState("error");
      });
  }, [courseId, quizId, router]);

  async function handleStart() {
    const session = getSession();
    if (!session || !courseId || !quizId) return;
    setStarting(true);
    setErrorMessage("");
    try {
      const attempt = await startQuizAttempt(session.token, courseId, quizId);
      router.push(
        `/courses/${courseId}/quizzes/${quizId}/attempts/${attempt.attemptId}`
      );
    } catch (error) {
      setStarting(false);
      setErrorMessage(
        extractErrorMessage(error, "Unable to start the quiz. Please try again.")
      );
    }
  }

  if (loadState === "checking" || loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center app-shell-bg p-6 text-sm text-slate-500">
        Loading quiz...
      </main>
    );
  }

  if (loadState === "error" || !quiz) {
    return (
      <main className="min-h-screen app-shell-bg p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {errorMessage || "This quiz could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  const bestScore = quiz.bestScorePercent;
  const resumeId = quiz.inProgressAttemptId;

  return (
    <main className="min-h-screen app-shell-bg p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {courseTitle || "course"}
          </Link>
        </div>

        <header className="mt-5 rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-semibold uppercase tracking-wide">
              <Brain className="h-3 w-3" />
              Practice test
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold uppercase tracking-wide">
              {courseTitle}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{quiz.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/90 md:text-base">
            {quiz.description}
          </p>
          <div className="mt-5 grid gap-2 text-xs text-white/90 sm:grid-cols-4">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {quiz.timeLimitMinutes} minutes
            </span>
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              {quiz.questionCount} questions
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              Pass at {quiz.passingScorePercent}%
            </span>
            <span className="inline-flex items-center gap-1">
              <History className="h-3.5 w-3.5" />
              {quiz.attemptCount} submitted
            </span>
          </div>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">Before you start</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                Only one option per question can be correct.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                The timer starts the moment you begin and runs even if you close
                the tab. Submit before it ends.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                After submitting, you will see the correct answer and explanation
                for every question.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                You can retake the quiz any time. Your best score is tracked.
              </li>
            </ul>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStart}
                disabled={starting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlayCircle className="h-4 w-4" />
                {starting
                  ? "Starting..."
                  : resumeId
                    ? "Resume attempt"
                    : quiz.attemptCount > 0
                      ? "Retake quiz"
                      : "Start attempt"}
              </button>
              <Link
                href={`/courses/${courseId}`}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel and go back
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Your scoreboard
              </h3>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Best score</span>
                <span className="font-semibold text-slate-900">
                  {bestScore != null ? `${bestScore}%` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last score</span>
                <span className="font-semibold text-slate-900">
                  {quiz.lastScorePercent != null
                    ? `${quiz.lastScorePercent}%`
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submitted attempts</span>
                <span className="font-semibold text-slate-900">
                  {quiz.attemptCount}
                </span>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">
              Attempt history
            </h2>
          </div>
          {history.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No attempts yet. Start the quiz to record your first score.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Started</th>
                    <th className="px-3 py-2">Submitted</th>
                    <th className="px-3 py-2">Correct</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map((item) => (
                    <tr key={item.attemptId} className="text-slate-700">
                      <td className="px-3 py-2">{formatDate(item.startedAt)}</td>
                      <td className="px-3 py-2">
                        {formatDate(item.submittedAt)}
                      </td>
                      <td className="px-3 py-2">
                        {item.correctAnswers}/{item.totalQuestions}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {item.status === "SUBMITTED"
                          ? `${item.scorePercent}%`
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        {item.status === "IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            In progress
                          </span>
                        ) : item.passed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/courses/${courseId}/quizzes/${quizId}/attempts/${item.attemptId}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          {item.status === "IN_PROGRESS" ? "Resume" : "Review"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
