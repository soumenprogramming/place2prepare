"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import { getSession, homePathForRole } from "@/lib/auth/session";
import {
  getCatalogCourses,
  getCatalogSubjects,
  type CatalogCourse,
  type CatalogSubject,
} from "@/lib/api/catalog";

type LoadState = "loading" | "ready" | "error";

const ALL_SUBJECTS = "__all__";

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

export default function CatalogPage() {
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>(ALL_SUBJECTS);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [homeHref, setHomeHref] = useState<string>("/");

  useEffect(() => {
    const session = getSession();
    setHomeHref(session ? homePathForRole(session.role) : "/");

    getCatalogSubjects()
      .then((data) => setSubjects(data))
      .catch(() => {
        // Subject list is a nice-to-have; keep the grid usable even if this fails.
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    setErrorMessage("");

    const subject =
      activeSubject === ALL_SUBJECTS ? undefined : activeSubject;
    const trimmedQuery = query.trim();

    getCatalogCourses({
      subject,
      q: trimmedQuery ? trimmedQuery : undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setCourses(data);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          extractErrorMessage(error, "Unable to load courses right now.")
        );
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [activeSubject, query]);

  const activeSubjectLabel = useMemo(() => {
    if (activeSubject === ALL_SUBJECTS) return "All subjects";
    return (
      subjects.find((subject) => subject.slug === activeSubject)?.name ??
      "Selected subject"
    );
  }, [activeSubject, subjects]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(searchInput);
  }

  function handleResetFilters() {
    setActiveSubject(ALL_SUBJECTS);
    setSearchInput("");
    setQuery("");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-5 rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {homeHref === "/" ? "home" : "dashboard"}
          </Link>
          <h1 className="mt-3 text-3xl font-bold">Browse the catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Explore every subject and course offered on Place2Prepare. New
            courses are assigned to your account by the team once you are ready.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="mt-5 flex flex-col gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur md:flex-row md:items-center"
          >
            <label className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search courses by name, description, or subject"
                className="flex-1 bg-transparent outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Search
            </button>
            {(activeSubject !== ALL_SUBJECTS || query) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Reset filters
              </button>
            )}
          </form>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <SlidersHorizontal className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Filter by subject</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSubject(ALL_SUBJECTS)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                activeSubject === ALL_SUBJECTS
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              All subjects
            </button>
            {subjects.map((subject) => {
              const active = activeSubject === subject.slug;
              return (
                <button
                  key={subject.slug}
                  type="button"
                  onClick={() => setActiveSubject(subject.slug)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                  }`}
                >
                  {subject.name}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {loadState === "ready" ? courses.length : "…"}
              </span>{" "}
              course{courses.length === 1 ? "" : "s"} in{" "}
              <span className="font-semibold text-slate-900">
                {activeSubjectLabel}
              </span>
              {query ? (
                <>
                  {" "}
                  matching{" "}
                  <span className="font-semibold text-slate-900">“{query}”</span>
                </>
              ) : null}
            </p>
          </div>

          {errorMessage ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          ) : null}

          {loadState === "loading" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No courses match your filters yet.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try another subject or clear the search to see everything.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                      {course.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      {course.premium ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          <Sparkles className="h-3 w-3" />
                          Premium
                        </span>
                      ) : null}
                      <DifficultyBadge level={course.difficulty} />
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-indigo-700">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {course.durationHours}h
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course.slug}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 shadow-sm">
          Enrollment is currently managed by the Place2Prepare team. Contact an
          administrator to request access to a specific course.
        </p>
      </div>
    </main>
  );
}
