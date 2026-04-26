"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Circle,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";
import {
  addAdminQuestion,
  createAdminQuiz,
  deleteAdminQuestion,
  deleteAdminQuiz,
  getAdminCourses,
  getAdminQuizzes,
  updateAdminQuestion,
  updateAdminQuiz,
  type AdminQuestion,
  type AdminQuestionPayload,
  type AdminQuiz,
  type AdminQuizPayload,
  type Course,
} from "@/lib/api/admin";

type QuizFormState = {
  title: string;
  slug: string;
  description: string;
  timeLimitMinutes: string;
  passingScorePercent: string;
  published: boolean;
};

type OptionFormState = {
  text: string;
  correct: boolean;
};

type QuestionFormState = {
  prompt: string;
  explanation: string;
  position: string;
  options: OptionFormState[];
};

const EMPTY_QUIZ_FORM: QuizFormState = {
  title: "",
  slug: "",
  description: "",
  timeLimitMinutes: "10",
  passingScorePercent: "60",
  published: true,
};

const EMPTY_QUESTION_FORM: QuestionFormState = {
  prompt: "",
  explanation: "",
  position: "",
  options: [
    { text: "", correct: true },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ],
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminQuizzesPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId;

  const [token, setToken] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const [quizForm, setQuizForm] = useState<QuizFormState>(EMPTY_QUIZ_FORM);
  const [quizEditingId, setQuizEditingId] = useState<number | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);

  const [questionForm, setQuestionForm] = useState<QuestionFormState>(
    EMPTY_QUESTION_FORM
  );
  const [questionEditingId, setQuestionEditingId] = useState<number | null>(
    null
  );
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null,
    [quizzes, selectedQuizId]
  );

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

    Promise.all([getAdminCourses(token), getAdminQuizzes(token, courseId)])
      .then(([courses, quizData]) => {
        if (cancelled) return;
        const found =
          courses.find((item) => String(item.id) === String(courseId)) ?? null;
        setCourse(found);
        setQuizzes(quizData);
        if (quizData.length > 0) {
          setSelectedQuizId((current) => current ?? quizData[0].id);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err, "Unable to load quizzes."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, token]);

  async function refreshQuizzes() {
    if (!token || !courseId) return;
    try {
      const data = await getAdminQuizzes(token, courseId);
      setQuizzes(data);
      if (selectedQuizId == null && data.length > 0) {
        setSelectedQuizId(data[0].id);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to reload quizzes."));
    }
  }

  function openCreateQuiz() {
    setQuizEditingId(null);
    setQuizForm(EMPTY_QUIZ_FORM);
    setShowQuizForm(true);
    setError("");
    setSuccess("");
  }

  function openEditQuiz(quiz: AdminQuiz) {
    setQuizEditingId(quiz.id);
    setQuizForm({
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      timeLimitMinutes: String(quiz.timeLimitMinutes),
      passingScorePercent: String(quiz.passingScorePercent),
      published: quiz.published,
    });
    setShowQuizForm(true);
    setError("");
    setSuccess("");
  }

  function closeQuizForm() {
    setShowQuizForm(false);
    setQuizEditingId(null);
    setQuizForm(EMPTY_QUIZ_FORM);
  }

  async function handleSubmitQuiz(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !courseId) return;
    setError("");
    setSuccess("");
    setSaving(true);
    const payload: AdminQuizPayload = {
      title: quizForm.title.trim(),
      slug: quizForm.slug.trim() || toSlug(quizForm.title),
      description: quizForm.description.trim(),
      timeLimitMinutes: Math.max(1, Number(quizForm.timeLimitMinutes) || 10),
      passingScorePercent: Math.max(
        0,
        Math.min(100, Number(quizForm.passingScorePercent) || 60)
      ),
      published: quizForm.published,
    };
    try {
      if (quizEditingId != null) {
        await updateAdminQuiz(token, courseId, quizEditingId, payload);
        setSuccess("Quiz updated.");
      } else {
        const created = await createAdminQuiz(token, courseId, payload);
        setSuccess("Quiz created.");
        setSelectedQuizId(created.id);
      }
      await refreshQuizzes();
      closeQuizForm();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to save this quiz."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuiz(quiz: AdminQuiz) {
    if (!token || !courseId) return;
    const confirmed = window.confirm(
      `Delete quiz "${quiz.title}"? All attempts and questions will be removed.`
    );
    if (!confirmed) return;
    setDeletingQuizId(quiz.id);
    setError("");
    setSuccess("");
    try {
      await deleteAdminQuiz(token, courseId, quiz.id);
      setSuccess("Quiz deleted.");
      if (selectedQuizId === quiz.id) setSelectedQuizId(null);
      await refreshQuizzes();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to delete this quiz."));
    } finally {
      setDeletingQuizId(null);
    }
  }

  function openCreateQuestion() {
    setQuestionEditingId(null);
    setQuestionForm(EMPTY_QUESTION_FORM);
    setShowQuestionForm(true);
    setError("");
    setSuccess("");
  }

  function openEditQuestion(question: AdminQuestion) {
    setQuestionEditingId(question.id);
    setQuestionForm({
      prompt: question.prompt,
      explanation: question.explanation ?? "",
      position: String(question.position),
      options: question.options.map((option) => ({
        text: option.text,
        correct: option.correct,
      })),
    });
    setShowQuestionForm(true);
    setError("");
    setSuccess("");
  }

  function closeQuestionForm() {
    setShowQuestionForm(false);
    setQuestionEditingId(null);
    setQuestionForm(EMPTY_QUESTION_FORM);
  }

  function updateOptionText(index: number, value: string) {
    setQuestionForm((prev) => {
      const options = prev.options.map((opt, idx) =>
        idx === index ? { ...opt, text: value } : opt
      );
      return { ...prev, options };
    });
  }

  function setCorrectOption(index: number) {
    setQuestionForm((prev) => {
      const options = prev.options.map((opt, idx) => ({
        ...opt,
        correct: idx === index,
      }));
      return { ...prev, options };
    });
  }

  function addOptionRow() {
    setQuestionForm((prev) => {
      if (prev.options.length >= 8) return prev;
      return {
        ...prev,
        options: [...prev.options, { text: "", correct: false }],
      };
    });
  }

  function removeOptionRow(index: number) {
    setQuestionForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const removed = prev.options[index];
      const options = prev.options.filter((_, idx) => idx !== index);
      if (removed.correct && options.length > 0) {
        options[0].correct = true;
      }
      return { ...prev, options };
    });
  }

  async function handleSubmitQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !courseId || !selectedQuiz) return;
    const trimmedOptions = questionForm.options.map((opt) => ({
      text: opt.text.trim(),
      correct: opt.correct,
    }));
    if (trimmedOptions.some((opt) => opt.text.length === 0)) {
      setError("Every option needs text.");
      return;
    }
    if (trimmedOptions.filter((opt) => opt.correct).length !== 1) {
      setError("Mark exactly one option as correct.");
      return;
    }
    setError("");
    setSuccess("");
    setSaving(true);

    const payload: AdminQuestionPayload = {
      prompt: questionForm.prompt.trim(),
      explanation: questionForm.explanation.trim() || null,
      position: questionForm.position ? Number(questionForm.position) : null,
      options: trimmedOptions.map((opt, idx) => ({
        text: opt.text,
        correct: opt.correct,
        position: idx + 1,
      })),
    };
    try {
      if (questionEditingId != null) {
        await updateAdminQuestion(
          token,
          courseId,
          selectedQuiz.id,
          questionEditingId,
          payload
        );
        setSuccess("Question updated.");
      } else {
        await addAdminQuestion(token, courseId, selectedQuiz.id, payload);
        setSuccess("Question added.");
      }
      await refreshQuizzes();
      closeQuestionForm();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to save this question."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(question: AdminQuestion) {
    if (!token || !courseId || !selectedQuiz) return;
    const confirmed = window.confirm(
      "Delete this question? This cannot be undone."
    );
    if (!confirmed) return;
    setDeletingQuestionId(question.id);
    setError("");
    setSuccess("");
    try {
      await deleteAdminQuestion(token, courseId, selectedQuiz.id, question.id);
      setSuccess("Question deleted.");
      await refreshQuizzes();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to delete this question."));
    } finally {
      setDeletingQuestionId(null);
    }
  }

  if (!token || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center app-shell-bg p-6 text-sm text-slate-500">
        Loading quiz manager...
      </main>
    );
  }

  return (
    <main className="min-h-screen app-shell-bg p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin dashboard
          </Link>
          {course ? (
            <Link
              href={`/admin/courses/${course.id}/lessons`}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Manage lessons
            </Link>
          ) : null}
        </div>

        <header className="rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            <Brain className="h-3.5 w-3.5" />
            Quiz manager
          </div>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            {course ? course.title : "Course quizzes"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Create timed practice tests with multiple-choice questions. Only
            published quizzes appear to enrolled students.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">Quizzes</h2>
              <Button type="button" size="sm" onClick={openCreateQuiz}>
                <PlusCircle className="mr-1 h-4 w-4" />
                New quiz
              </Button>
            </div>
            {quizzes.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No quizzes yet. Create your first practice test.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {quizzes.map((quiz) => {
                  const isActive = quiz.id === selectedQuizId;
                  return (
                    <li key={quiz.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedQuizId(quiz.id)}
                        className={`flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition ${
                          isActive
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {quiz.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              quiz.published
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {quiz.published ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                            {quiz.published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span>{quiz.questionCount} questions</span>
                          <span>{quiz.timeLimitMinutes} min</span>
                          <span>Pass {quiz.passingScorePercent}%</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="space-y-5">
            {showQuizForm ? (
              <form
                onSubmit={handleSubmitQuiz}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {quizEditingId != null ? "Edit quiz" : "Create quiz"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeQuizForm}
                    className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                    Title
                    <Input
                      value={quizForm.title}
                      onChange={(event) => {
                        const title = event.target.value;
                        setQuizForm((prev) => ({
                          ...prev,
                          title,
                          slug:
                            quizEditingId == null && prev.slug === toSlug(prev.title)
                              ? toSlug(title)
                              : prev.slug,
                        }));
                      }}
                      required
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Slug
                    <Input
                      value={quizForm.slug}
                      onChange={(event) =>
                        setQuizForm((prev) => ({
                          ...prev,
                          slug: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Time limit (minutes)
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      value={quizForm.timeLimitMinutes}
                      onChange={(event) =>
                        setQuizForm((prev) => ({
                          ...prev,
                          timeLimitMinutes: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Passing score (%)
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={quizForm.passingScorePercent}
                      onChange={(event) =>
                        setQuizForm((prev) => ({
                          ...prev,
                          passingScorePercent: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={quizForm.published}
                      onChange={(event) =>
                        setQuizForm((prev) => ({
                          ...prev,
                          published: event.target.checked,
                        }))
                      }
                    />
                    Published (visible to students)
                  </label>
                  <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                    Description
                    <textarea
                      rows={3}
                      value={quizForm.description}
                      onChange={(event) =>
                        setQuizForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-200"
                      required
                    />
                  </label>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                    {quizEditingId != null ? "Save changes" : "Create quiz"}
                  </Button>
                  <button
                    type="button"
                    onClick={closeQuizForm}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {selectedQuiz ? (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      Quiz details
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      {selectedQuiz.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedQuiz.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span>{selectedQuiz.timeLimitMinutes} min</span>
                      <span>Pass {selectedQuiz.passingScorePercent}%</span>
                      <span>{selectedQuiz.questionCount} questions</span>
                      <span>
                        {selectedQuiz.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditQuiz(selectedQuiz)}
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuiz(selectedQuiz)}
                      disabled={deletingQuizId === selectedQuiz.id}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      {deletingQuizId === selectedQuiz.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ) : null}

            {selectedQuiz ? (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Questions ({selectedQuiz.questions.length})
                  </h3>
                  <Button type="button" size="sm" onClick={openCreateQuestion}>
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add question
                  </Button>
                </div>

                {showQuestionForm ? (
                  <form
                    onSubmit={handleSubmitQuestion}
                    className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {questionEditingId != null
                          ? "Edit question"
                          : "New question"}
                      </h4>
                      <button
                        type="button"
                        onClick={closeQuestionForm}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <label className="mt-3 block text-xs font-semibold text-slate-700">
                      Prompt
                      <textarea
                        rows={2}
                        value={questionForm.prompt}
                        onChange={(event) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            prompt: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-200"
                        required
                      />
                    </label>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-700">
                        Options (mark exactly one correct)
                      </p>
                      {questionForm.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                        >
                          <input
                            type="radio"
                            name="correct-option"
                            checked={option.correct}
                            onChange={() => setCorrectOption(index)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Input
                            value={option.text}
                            onChange={(event) =>
                              updateOptionText(index, event.target.value)
                            }
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                            required
                          />
                          {questionForm.options.length > 2 ? (
                            <button
                              type="button"
                              onClick={() => removeOptionRow(index)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      ))}
                      {questionForm.options.length < 8 ? (
                        <button
                          type="button"
                          onClick={addOptionRow}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Add option
                        </button>
                      ) : null}
                    </div>
                    <label className="mt-3 block text-xs font-semibold text-slate-700">
                      Explanation (shown after submit)
                      <textarea
                        rows={3}
                        value={questionForm.explanation}
                        onChange={(event) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            explanation: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-200"
                      />
                    </label>
                    <div className="mt-4 flex items-center gap-2">
                      <Button type="submit" size="sm" disabled={saving}>
                        {saving ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : null}
                        {questionEditingId != null
                          ? "Save changes"
                          : "Add question"}
                      </Button>
                      <button
                        type="button"
                        onClick={closeQuestionForm}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}

                {selectedQuiz.questions.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No questions yet. Add at least one question so students can
                    take this quiz.
                  </p>
                ) : (
                  <ol className="mt-4 space-y-3">
                    {selectedQuiz.questions.map((question, idx) => (
                      <li
                        key={question.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Question {idx + 1}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {question.prompt}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditQuestion(question)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                              aria-label="Edit question"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(question)}
                              disabled={deletingQuestionId === question.id}
                              className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                              aria-label="Delete question"
                            >
                              {deletingQuestionId === question.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1.5">
                          {question.options.map((option) => (
                            <li
                              key={option.id}
                              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                                option.correct
                                  ? "bg-emerald-50 text-emerald-800"
                                  : "bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span className="font-bold">
                                {String.fromCharCode(65 + option.position - 1)}.
                              </span>
                              <span className="flex-1">{option.text}</span>
                              {option.correct ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              ) : null}
                            </li>
                          ))}
                        </ul>
                        {question.explanation ? (
                          <p className="mt-3 rounded-lg bg-indigo-50/60 p-2 text-xs text-slate-600">
                            <span className="font-semibold text-indigo-900">
                              Explanation:
                            </span>{" "}
                            {question.explanation}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            ) : (
              <article className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                Select a quiz on the left or create a new one to start adding
                questions.
              </article>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
