"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Loader2,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";
import {
  getQuizAttempt,
  submitQuizAttempt,
  type AttemptQuestion,
  type AttemptResponse,
} from "@/lib/api/quizzes";

type LoadState = "checking" | "loading" | "ready" | "error";

function formatDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function QuizAttemptPage() {
  const router = useRouter();
  const params = useParams<{
    courseId: string;
    quizId: string;
    attemptId: string;
  }>();
  const courseId = params?.courseId;
  const quizId = params?.quizId;
  const attemptId = params?.attemptId;

  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const autoSubmitRef = useRef(false);

  const isReview = attempt?.status === "SUBMITTED";

  const loadAttempt = useCallback(async () => {
    const session = getSession();
    if (!session || !courseId || !quizId || !attemptId) return;
    try {
      const data = await getQuizAttempt(session.token, attemptId);
      setAttempt(data);
      if (data.status === "IN_PROGRESS") {
        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(data.startedAt).getTime()) / 1000
        );
        const totalSeconds = data.timeLimitMinutes * 60;
        setRemaining(Math.max(0, totalSeconds - elapsedSeconds));
      }
      const preselected: Record<number, number | null> = {};
      data.questions.forEach((question) => {
        const chosen = question.options.find((option) => option.selected);
        preselected[question.id] = chosen ? chosen.id : null;
      });
      setAnswers(preselected);
      setLoadState("ready");
    } catch (error: unknown) {
      const status =
        error && typeof error === "object" && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;
      if (status === 401) {
        clearSession();
        router.replace(
          `/login?redirect=${encodeURIComponent(
            `/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}`
          )}`
        );
        return;
      }
      if (status === 403 || status === 404) {
        router.replace(`/courses/${courseId}/quizzes/${quizId}`);
        return;
      }
      setErrorMessage(
        extractErrorMessage(error, "Unable to load this attempt.")
      );
      setLoadState("error");
    }
  }, [attemptId, courseId, quizId, router]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          `/courses/${courseId ?? ""}/quizzes/${quizId ?? ""}/attempts/${attemptId ?? ""}`
        )}`
      );
      return;
    }
    if (!courseId || !quizId || !attemptId) {
      setErrorMessage("Attempt not found.");
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    void loadAttempt();
  }, [attemptId, courseId, loadAttempt, quizId, router]);

  const handleSubmit = useCallback(
    async (options?: { auto?: boolean }) => {
      const session = getSession();
      if (!session || !attemptId || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      setErrorMessage("");
      try {
        const payload = {
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId: Number(questionId),
            optionId: optionId ?? null,
          })),
        };
        const result = await submitQuizAttempt(
          session.token,
          attemptId,
          payload
        );
        setAttempt(result);
        setRemaining(0);
      } catch (error) {
        submittedRef.current = false;
        setErrorMessage(
          extractErrorMessage(
            error,
            options?.auto
              ? "Time is up but we could not submit. Please try again."
              : "Unable to submit this attempt. Please try again."
          )
        );
      } finally {
        setSubmitting(false);
      }
    },
    [answers, attemptId]
  );

  useEffect(() => {
    if (!attempt || attempt.status !== "IN_PROGRESS") return;
    if (remaining <= 0) {
      if (!autoSubmitRef.current) {
        autoSubmitRef.current = true;
        void handleSubmit({ auto: true });
      }
      return;
    }
    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attempt, remaining, handleSubmit]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value != null).length,
    [answers]
  );

  if (loadState === "checking" || loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm text-slate-500">
        Loading quiz attempt...
      </main>
    );
  }

  if (loadState === "error" || !attempt) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/courses/${courseId}/quizzes/${quizId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to quiz
          </Link>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {errorMessage || "This attempt could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  const question: AttemptQuestion | undefined = attempt.questions[activeIndex];
  const canNavigatePrev = activeIndex > 0;
  const canNavigateNext = activeIndex < attempt.questions.length - 1;

  return (
    <main className="min-h-screen bg-slate-100 pb-16">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/courses/${courseId}/quizzes/${quizId}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {attempt.courseTitle}
              </p>
              <p className="truncate text-sm font-bold text-slate-900">
                {attempt.quizTitle}
              </p>
            </div>
          </div>
          {!isReview ? (
            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                  remaining <= 30
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : remaining <= 120
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <Clock3 className="h-3.5 w-3.5" />
                {formatDuration(remaining)}
              </div>
              <span className="hidden text-xs text-slate-500 md:inline">
                {answeredCount} / {attempt.totalQuestions} answered
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${
                  attempt.passed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {attempt.passed ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {attempt.passed ? "Passed" : "Not passed"}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                {attempt.scorePercent}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        {isReview ? (
          <section className="rounded-2xl bg-brand-gradient p-6 text-white shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
              <Trophy className="h-3.5 w-3.5" />
              Attempt summary
            </div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {attempt.scorePercent}%
              <span className="ml-2 text-base font-semibold text-white/80">
                ({attempt.correctAnswers} / {attempt.totalQuestions} correct)
              </span>
            </h1>
            <p className="mt-2 text-sm text-white/90">
              {attempt.passed
                ? `Great work! You cleared the passing mark of ${attempt.passingScorePercent}%.`
                : `Passing mark is ${attempt.passingScorePercent}%. Review the explanations below and try again.`}
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Question {activeIndex + 1} of {attempt.totalQuestions}
              </p>
              <p className="text-xs font-semibold text-slate-500 md:hidden">
                {answeredCount}/{attempt.totalQuestions} answered
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                style={{
                  width: `${((activeIndex + 1) / attempt.totalQuestions) * 100}%`,
                }}
              />
            </div>
          </section>
        )}

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {isReview ? (
          <div className="mt-6 space-y-5">
            {attempt.questions.map((item, idx) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-slate-900">
                    {idx + 1}. {item.prompt}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      item.correct === true
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.correct === true ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {item.correct === true ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {item.options.map((option) => {
                    const isAnswer = option.correct === true;
                    const wasSelected = option.selected;
                    let tone = "border-slate-200 bg-white";
                    if (isAnswer) tone = "border-emerald-200 bg-emerald-50";
                    if (wasSelected && !isAnswer)
                      tone = "border-rose-200 bg-rose-50";
                    return (
                      <li
                        key={option.id}
                        className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-sm ${tone}`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                            isAnswer
                              ? "border-emerald-400 bg-emerald-500 text-white"
                              : wasSelected
                                ? "border-rose-400 bg-rose-500 text-white"
                                : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + option.position - 1)}
                        </span>
                        <span className="flex-1 text-slate-800">
                          {option.text}
                        </span>
                        {wasSelected ? (
                          <span className="text-[10px] font-semibold uppercase text-slate-500">
                            Your choice
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {item.explanation ? (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-indigo-900">Explanation</p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/courses/${courseId}/quizzes/${quizId}`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to quiz overview
              </Link>
              <Link
                href={`/courses/${courseId}`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Back to course
              </Link>
            </div>
          </div>
        ) : question ? (
          <div className="mt-6 grid gap-5 md:grid-cols-[1fr_220px]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                {question.prompt}
              </h2>
              <ul className="mt-4 space-y-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.id,
                          }))
                        }
                        className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                          selected
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                            selected
                              ? "border-indigo-500 bg-indigo-500 text-white"
                              : "border-slate-300 text-slate-500 group-hover:border-indigo-300"
                          }`}
                        >
                          {String.fromCharCode(65 + option.position - 1)}
                        </span>
                        <span className="flex-1 text-slate-800">
                          {option.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    canNavigatePrev && setActiveIndex((idx) => idx - 1)
                  }
                  disabled={!canNavigatePrev}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                {canNavigateNext ? (
                  <button
                    type="button"
                    onClick={() => setActiveIndex((idx) => idx + 1)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit answers
                  </button>
                )}
              </div>
            </article>

            <aside className="flex flex-col gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question map
                </p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {attempt.questions.map((item, idx) => {
                    const answered = answers[item.id] != null;
                    const isCurrent = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`h-9 rounded-lg border text-xs font-bold transition ${
                          isCurrent
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : answered
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {answeredCount} of {attempt.totalQuestions} answered
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                Finish and submit
              </button>
              <p className="text-[11px] text-slate-500">
                Unanswered questions are marked incorrect. Leaving the page does
                not stop the timer.
              </p>
            </aside>
          </div>
        ) : null}

        {isReview ? null : (
          <div className="mt-6 flex items-center justify-end text-xs text-slate-500">
            <ArrowRight className="mr-1 h-3 w-3" />
            Once submitted, you will see the correct answers and explanations.
          </div>
        )}
      </div>
    </main>
  );
}
