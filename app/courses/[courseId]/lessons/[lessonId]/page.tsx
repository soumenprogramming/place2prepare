"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";
import {
  getLesson,
  setLessonCompletion,
  type LessonCompletionResult,
  type LessonDetail,
} from "@/lib/api/lessons";
import { toEmbeddableVideo } from "@/lib/utils/video";

type LoadState = "checking" | "loading" | "ready" | "error";

export default function LessonPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = params?.courseId;
  const lessonId = params?.lessonId;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [completion, setCompletion] =
    useState<Pick<LessonCompletionResult, "completedLessons" | "totalLessons" | "progressPercentage"> | null>(
      null
    );
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      const target = courseId && lessonId
        ? `/courses/${courseId}/lessons/${lessonId}`
        : "/courses";
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    if (!courseId || !lessonId) {
      setErrorMessage("Lesson not found.");
      setLoadState("error");
      return;
    }

    setLoadState("loading");
    getLesson(session.token, courseId, lessonId)
      .then((response) => {
        setLesson(response);
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
            `/login?redirect=${encodeURIComponent(`/courses/${courseId}/lessons/${lessonId}`)}`
          );
          return;
        }
        if (status === 403) {
          router.replace(`/courses/${courseId}`);
          return;
        }
        setErrorMessage(
          extractErrorMessage(error, "Unable to load this lesson right now.")
        );
        setLoadState("error");
      });
  }, [courseId, lessonId, router]);

  async function toggleCompletion(nextCompleted: boolean) {
    if (!lesson || !courseId) return;
    const session = getSession();
    if (!session) return;
    setIsToggling(true);
    try {
      const result = await setLessonCompletion(
        session.token,
        courseId,
        lesson.id,
        nextCompleted
      );
      setLesson({ ...lesson, completed: result.completed });
      setCompletion({
        completedLessons: result.completedLessons,
        totalLessons: result.totalLessons,
        progressPercentage: result.progressPercentage,
      });
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(error, "Unable to save your progress right now.")
      );
    } finally {
      setIsToggling(false);
    }
  }

  if (loadState === "checking" || loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm text-slate-500">
        Loading lesson...
      </main>
    );
  }

  if (loadState === "error" || !lesson) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href={courseId ? `/courses/${courseId}` : "/courses"}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {errorMessage || "This lesson could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  const video = toEmbeddableVideo(lesson.videoUrl);
  const completedCount = completion?.completedLessons;
  const totalCount = completion?.totalLessons;

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/courses/${lesson.courseId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            {lesson.courseTitle}
          </Link>
          {completedCount != null && totalCount != null ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {completedCount} / {totalCount} lessons done
            </span>
          ) : null}
        </div>

        <header className="rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <p className="text-xs uppercase tracking-widest text-white/70">
            Lesson {lesson.position}
          </p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{lesson.title}</h1>
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-white/85">
            <Clock3 className="h-4 w-4" />
            {lesson.durationMinutes} min
          </p>
        </header>

        {errorMessage ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {video ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
            {video.kind === "youtube" || video.kind === "vimeo" ? (
              <div className="relative aspect-video w-full">
                <iframe
                  src={video.embedUrl}
                  title={lesson.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : video.kind === "file" ? (
              <video controls className="aspect-video w-full">
                <source src={video.url} />
              </video>
            ) : (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-900 px-6 py-8 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <ExternalLink className="h-4 w-4" />
                Open video
              </a>
            )}
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lesson.contentMarkdown || "_This lesson has no written content yet._"}
            </ReactMarkdown>
          </article>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          {lesson.completed ? (
            <button
              type="button"
              onClick={() => toggleCompletion(false)}
              disabled={isToggling}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Mark as incomplete
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleCompletion(true)}
              disabled={isToggling}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark as complete
            </button>
          )}
          <div className="flex items-center gap-2">
            {lesson.previousLessonId ? (
              <Link
                href={`/courses/${lesson.courseId}/lessons/${lesson.previousLessonId}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : null}
            {lesson.nextLessonId ? (
              <Link
                href={`/courses/${lesson.courseId}/lessons/${lesson.nextLessonId}`}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/courses/${lesson.courseId}`}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Back to overview
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
