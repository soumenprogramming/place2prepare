"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  PlusCircle,
  Radio,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";
import {
  createAdminLiveSession,
  deleteAdminLiveSession,
  getAdminCourses,
  getAdminLiveSessions,
  updateAdminLiveSession,
  type AdminLiveSession,
  type AdminLiveSessionPayload,
  type Course,
} from "@/lib/api/admin";

type LoadState = "checking" | "loading" | "ready";

type FormState = {
  title: string;
  description: string;
  instructorName: string;
  courseId: string;
  scheduledAt: string;
  durationMinutes: string;
  joinUrl: string;
  status: AdminLiveSession["status"];
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  instructorName: "",
  courseId: "",
  scheduledAt: "",
  durationMinutes: "60",
  joinUrl: "",
  status: "SCHEDULED",
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString();
}

function formatScheduled(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusPalette(status: AdminLiveSession["status"]) {
  switch (status) {
    case "LIVE":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "COMPLETED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "CANCELLED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
  }
}

export default function AdminLiveSessionsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AdminLiveSession[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setToken(session.token);

    Promise.all([
      getAdminLiveSessions(session.token),
      getAdminCourses(session.token),
    ])
      .then(([fetchedSessions, fetchedCourses]) => {
        setSessions(fetchedSessions);
        setCourses(fetchedCourses);
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        const status =
          err && typeof err === "object" && "status" in err
            ? Number((err as { status?: number }).status)
            : undefined;
        if (status === 401 || status === 403) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(extractErrorMessage(err, "Unable to load live sessions."));
        setLoadState("ready");
      });
  }, [router]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }, [sessions]);

  const upcomingCount = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.status !== "COMPLETED" &&
          s.status !== "CANCELLED" &&
          new Date(s.scheduledAt).getTime() > Date.now()
      ).length,
    [sessions]
  );

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function loadIntoForm(session: AdminLiveSession) {
    setEditingId(session.id);
    setForm({
      title: session.title,
      description: session.description ?? "",
      instructorName: session.instructorName ?? "",
      courseId: session.courseId != null ? String(session.courseId) : "",
      scheduledAt: isoToLocalInput(session.scheduledAt),
      durationMinutes: String(session.durationMinutes),
      joinUrl: session.joinUrl ?? "",
      status: session.status,
    });
    setSuccess("");
    setError("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onSubmit() {
    if (!token) return;
    setError("");
    setSuccess("");
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.scheduledAt) {
      setError("Schedule date & time are required.");
      return;
    }
    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration < 5 || duration > 600) {
      setError("Duration must be between 5 and 600 minutes.");
      return;
    }

    const payload: AdminLiveSessionPayload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      instructorName: form.instructorName.trim() || null,
      courseId: form.courseId ? Number(form.courseId) : null,
      scheduledAt: localInputToIso(form.scheduledAt),
      durationMinutes: duration,
      joinUrl: form.joinUrl.trim() || null,
      status: form.status,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        const updated = await updateAdminLiveSession(token, editingId, payload);
        setSessions((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s))
        );
        setSuccess("Live session updated.");
      } else {
        const created = await createAdminLiveSession(token, payload);
        setSessions((prev) => [created, ...prev]);
        setSuccess("Live session scheduled.");
      }
      resetForm();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to save live session."));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Delete this live session? This cannot be undone.")) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      setDeletingId(id);
      await deleteAdminLiveSession(token, id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
      setSuccess("Live session deleted.");
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to delete live session."));
    } finally {
      setDeletingId(null);
    }
  }

  if (loadState === "checking" || loadState === "loading") {
    return <PageLoader message="Loading live sessions…" />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f6fb] p-4 md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_-10%,rgba(99,102,241,0.07),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin dashboard
          </Link>
          <Link
            href="/live"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            View student calendar
          </Link>
        </div>

        <header className="rounded-[1.75rem] border border-white/15 bg-brand-gradient p-6 text-white shadow-[0_28px_60px_-24px_rgba(79,70,229,0.45)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/85">Mentor operations</p>
              <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
                Live sessions manager
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/90">
                Schedule doubt-clearing sessions, mock interviews, and community
                Q&amp;As. Students see sessions tied to the courses they&apos;re
                enrolled in; leave course empty for a community session.
              </p>
            </div>
            <div className="grid gap-2 text-right text-xs text-white/85">
              <span>
                <span className="text-2xl font-bold text-white">
                  {sessions.length}
                </span>{" "}
                total sessions
              </span>
              <span>
                <span className="text-2xl font-bold text-white">
                  {upcomingCount}
                </span>{" "}
                upcoming
              </span>
            </div>
          </div>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit live session" : "Schedule a new live session"}
              </h2>
              <p className="text-xs text-slate-500">
                Students get a &ldquo;Join now&rdquo; button 15 minutes before
                the scheduled start.
              </p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel edit
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input
              label="Title"
              placeholder="DSA Doubt Clearing: Arrays & Hashing"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              label="Instructor name"
              placeholder="Soumen Pradhan"
              value={form.instructorName}
              onChange={(e) =>
                setForm((p) => ({ ...p, instructorName: e.target.value }))
              }
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                placeholder="What will students get out of this session?"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Course
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={form.courseId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courseId: e.target.value }))
                }
              >
                <option value="">Community (no course)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Course-linked sessions are visible only to enrolled learners.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as AdminLiveSession["status"],
                  }))
                }
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live now</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Scheduled at
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledAt: e.target.value }))
                }
              />
            </div>
            <Input
              label="Duration (minutes)"
              type="number"
              min={5}
              max={600}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((p) => ({ ...p, durationMinutes: e.target.value }))
              }
            />
            <div className="md:col-span-2">
              <Input
                label="Join URL (Zoom, Google Meet, etc.)"
                placeholder="https://meet.example.com/..."
                value={form.joinUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, joinUrl: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={onSubmit} loading={submitting}>
              {editingId ? (
                <>
                  <Pencil className="mr-1 h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Schedule session
                </>
              )}
            </Button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Reset to new session
              </button>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All sessions</h2>
              <p className="text-xs text-slate-500">
                Most recent first. Click a row to edit.
              </p>
            </div>
          </div>

          {sortedSessions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No live sessions scheduled yet.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create your first session using the form above.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {sortedSessions.map((session) => {
                const isEditing = editingId === session.id;
                return (
                  <li
                    key={session.id}
                    className={`rounded-xl border p-4 transition ${
                      isEditing
                        ? "border-indigo-300 bg-indigo-50/40"
                        : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {session.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusPalette(
                              session.status
                            )}`}
                          >
                            {session.status === "LIVE" ? (
                              <Radio className="h-3 w-3" />
                            ) : session.status === "COMPLETED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : null}
                            {session.status.toLowerCase()}
                          </span>
                          {session.courseTitle ? (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                              {session.courseTitle}
                            </span>
                          ) : (
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Community
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatScheduled(session.scheduledAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {session.durationMinutes} min
                          </span>
                          {session.instructorName ? (
                            <span>by {session.instructorName}</span>
                          ) : null}
                          {session.joinUrl ? (
                            <a
                              href={session.joinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Open link
                            </a>
                          ) : (
                            <span className="text-amber-700">
                              Missing join URL
                            </span>
                          )}
                        </div>
                        {session.description ? (
                          <p className="mt-2 text-xs text-slate-600">
                            {session.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => loadIntoForm(session)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(session.id)}
                          disabled={deletingId === session.id}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          {deletingId === session.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
