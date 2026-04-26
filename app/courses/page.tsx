"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
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
    BEGINNER: "border-emerald-200 bg-emerald-50 text-emerald-700",
    INTERMEDIATE: "border-sky-200 bg-sky-50 text-sky-700",
    ADVANCED: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        palette[normalized] ?? "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {normalized || "GENERAL"}
    </span>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-3 h-6 w-3/4 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-2 space-y-1.5">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="border-t border-slate-100 px-5 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
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

    const subject = activeSubject === ALL_SUBJECTS ? undefined : activeSubject;
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

  const hasActiveFilters = activeSubject !== ALL_SUBJECTS || query;

  return (
    <main className="min-h-screen app-shell-bg p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <header className="relative mb-5 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft md:p-8">
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
            <Link
              href={homeHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/75 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to {homeHref === "/" ? "home" : "dashboard"}
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Browse the catalog
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85">
              Explore every subject and course offered on Place2Prepare. New
              courses are assigned to your account by the team once you are ready.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-5 flex flex-col gap-2.5 md:flex-row md:items-center"
            >
              <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus-within:border-white/40 focus-within:bg-white/20">
                <Search className="h-4 w-4 shrink-0 text-white/70" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search courses by name, description, or subject…"
                  className="flex-1 bg-transparent text-white placeholder:text-white/60 outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                Search
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                  Reset
                </button>
              )}
            </form>
          </div>
        </header>

        {/* Subject filters */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold">Filter by subject</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSubject(ALL_SUBJECTS)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                activeSubject === ALL_SUBJECTS
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
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
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                  }`}
                >
                  {subject.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {loadState === "ready" ? courses.length : "…"}
              </span>{" "}
              course{courses.length === 1 ? "" : "s"} in{" "}
              <span className="font-bold text-slate-900">{activeSubjectLabel}</span>
              {query && (
                <>
                  {" "}matching{" "}
                  <span className="font-bold text-slate-900">&ldquo;{query}&rdquo;</span>
                </>
              )}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              {errorMessage}
            </div>
          )}

          {loadState === "loading" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <BookOpen className="h-7 w-7 text-slate-400" />
              </div>
              <p className="mt-4 text-base font-bold text-slate-700">
                No courses match your filters yet.
              </p>
              <p className="mt-1.5 text-sm text-slate-500">
                Try another subject or clear the search to see everything.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                <X className="h-4 w-4" />
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-card-hover"
                >
                  {/* Card top accent */}
                  <div className="h-1 w-full bg-brand-gradient opacity-0 transition group-hover:opacity-100" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                        {course.subject}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {course.premium && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                            <Sparkles className="h-3 w-3" />
                            Premium
                          </span>
                        )}
                        <DifficultyBadge level={course.difficulty} />
                      </div>
                    </div>
                    <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 transition group-hover:text-indigo-700">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {course.durationHours}h
                    </span>
                    <span className="inline-flex items-center gap-1 text-indigo-500 opacity-0 transition group-hover:opacity-100">
                      View course →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 shadow-card">
          Enrollment is currently managed by the Place2Prepare team. Contact an
          administrator to request access to a specific course.
        </p>
      </div>
    </main>
  );
}
