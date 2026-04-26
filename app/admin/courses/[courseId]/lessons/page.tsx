"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Loader2,
  Pencil,
  PlusCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";
import {
  createAdminLesson,
  deleteAdminLesson,
  getAdminCourses,
  getAdminLessons,
  updateAdminLesson,
  type AdminLesson,
  type AdminLessonPayload,
  type Course,
} from "@/lib/api/admin";

type FormState = {
  title: string;
  slug: string;
  contentMarkdown: string;
  videoUrl: string;
  durationMinutes: string;
  position: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  contentMarkdown: "",
  videoUrl: "",
  durationMinutes: "15",
  position: "",
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminLessonsPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId;

  const [token, setToken] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "ADMIN") {
      clearSession();
      router.replace("/login");
      return;
    }
    setToken(session.token);
  }, [router]);

  useEffect(() => {
    if (!token || !courseId) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getAdminCourses(token), getAdminLessons(token, courseId)])
      .then(([courses, lessonData]) => {
        if (cancelled) return;
        const found = courses.find(
          (item) => String(item.id) === String(courseId)
        );
        if (!found) {
          setError("Course not found.");
          setLoading(false);
          return;
        }
        setCourse(found);
        setLessons(lessonData);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const status =
          err && typeof err === "object" && "status" in err
            ? Number((err as { status?: number }).status)
            : undefined;
        if (status === 401 || status === 403) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(extractErrorMessage(err, "Unable to load lessons."));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, courseId, router]);

  const nextPosition = useMemo(() => {
    if (lessons.length === 0) return 1;
    return lessons[lessons.length - 1].position + 1;
  }, [lessons]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(lesson: AdminLesson) {
    setEditingId(lesson.id);
    setForm({
      title: lesson.title,
      slug: lesson.slug,
      contentMarkdown: lesson.contentMarkdown,
      videoUrl: lesson.videoUrl ?? "",
      durationMinutes: String(lesson.durationMinutes),
      position: String(lesson.position),
    });
    setError("");
    setSuccess("");
  }

  async function refresh() {
    if (!token || !courseId) return;
    const updated = await getAdminLessons(token, courseId);
    setLessons(updated);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !courseId) return;
    setError("");
    setSuccess("");

    const duration = Number(form.durationMinutes);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.contentMarkdown.trim()) {
      setError("Lesson content is required.");
      return;
    }
    if (!Number.isFinite(duration) || duration < 1 || duration > 600) {
      setError("Duration should be between 1 and 600 minutes.");
      return;
    }

    const payload: AdminLessonPayload = {
      title: form.title.trim(),
      slug: form.slug.trim() || toSlug(form.title),
      contentMarkdown: form.contentMarkdown,
      videoUrl: form.videoUrl.trim() || null,
      durationMinutes: duration,
      position: form.position ? Number(form.position) : null,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateAdminLesson(token, courseId, editingId, payload);
        setSuccess("Lesson updated.");
      } else {
        await createAdminLesson(token, courseId, payload);
        setSuccess("Lesson created.");
      }
      resetForm();
      await refresh();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to save lesson."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lesson: AdminLesson) {
    if (!token || !courseId) return;
    const confirmed = window.confirm(
      `Delete "${lesson.title}"? This also clears student progress for it.`
    );
    if (!confirmed) return;
    setDeleting(lesson.id);
    setError("");
    setSuccess("");
    try {
      await deleteAdminLesson(token, courseId, lesson.id);
      if (editingId === lesson.id) resetForm();
      setSuccess("Lesson deleted.");
      await refresh();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to delete lesson."));
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center app-shell-bg p-6 text-sm text-slate-500">
        Loading lesson manager...
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen app-shell-bg p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin dashboard
          </Link>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error || "Course not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-shell-bg p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin dashboard
          </Link>
        </div>

        <header className="rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <p className="text-xs uppercase tracking-widest text-white/70">
            {course.subject}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold md:text-4xl">{course.title}</h1>
            {course.premium ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900">
                <Sparkles className="h-3 w-3" />
                Premium
              </span>
            ) : null}
          </div>
          <p className="mt-3 max-w-3xl text-sm text-white/90">
            Manage the lessons, ordering, and content students see inside this
            course. Student progress recalculates automatically when you add or
            remove lessons.
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Lessons</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {lessons.length} total
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {lessons.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No lessons yet. Create the first one using the form.
                </p>
              ) : null}
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                    editingId === lesson.id
                      ? "border-indigo-300 bg-indigo-50/60"
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {lesson.position}. {lesson.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {lesson.durationMinutes} min
                      </span>
                      <span className="truncate">{lesson.slug}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(lesson)}
                      className="rounded-md border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson)}
                      disabled={deleting === lesson.id}
                      className="rounded-md border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete"
                    >
                      {deleting === lesson.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingId ? (
                  <Pencil className="h-4 w-4 text-indigo-600" />
                ) : (
                  <PlusCircle className="h-4 w-4 text-indigo-600" />
                )}
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit lesson" : "Add a new lesson"}
                </h2>
              </div>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <X className="h-3 w-3" />
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Input
                label="Lesson title"
                placeholder="Introduction to arrays"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                    slug: prev.slug || toSlug(event.target.value),
                  }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Slug"
                  placeholder="intro-to-arrays"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                />
                <Input
                  label="Duration (minutes)"
                  type="number"
                  min={1}
                  max={600}
                  value={form.durationMinutes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      durationMinutes: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Video URL (optional)"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.videoUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      videoUrl: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Position"
                  type="number"
                  min={1}
                  placeholder={String(editingId ? form.position || 1 : nextPosition)}
                  value={form.position}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, position: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Content (Markdown)
                </label>
                <textarea
                  className="min-h-[220px] w-full rounded-xl border border-input bg-white px-3 py-2 font-mono text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.contentMarkdown}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contentMarkdown: event.target.value,
                    }))
                  }
                  placeholder={`# Topic\n\nExplain the concept with **markdown**...\n\n- Bullet point\n- Another point\n\n\`\`\`js\nconsole.log('hello');\n\`\`\``}
                  required
                />
              </div>
              {form.contentMarkdown.trim() ? (
                <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Preview
                  </summary>
                  <article className="prose prose-slate mt-3 max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {form.contentMarkdown}
                    </ReactMarkdown>
                  </article>
                </details>
              ) : null}
              <div className="flex items-center gap-2">
                <Button type="submit" loading={saving} className="flex-1">
                  {editingId ? "Save changes" : "Create lesson"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <BookOpen className="h-3 w-3" />
                Changes recalculate student progress automatically.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
