"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  FileText,
  Brain,
  ShieldCheck,
  Pencil,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/lib/api/auth";
import NotificationBell from "@/components/notifications/notification-bell";
import { PageLoader } from "@/components/ui/page-loader";
import {
  assignCourseToStudent,
  deleteStudent,
  createCourse,
  createSubject,
  getAdminCourses,
  getAdminOverview,
  getAdminAdmins,
  getAdminStudentProfile,
  getAdminStudents,
  getAdminSubjects,
  removeCourseFromStudent,
  updateStudentEnrollment,
  type AdminOverview,
  type AdminStudentProfile,
  type AdminStudent,
  type Course,
  type StudentEnrollment,
  type Subject,
} from "@/lib/api/admin";
import { ApiError, extractErrorMessage } from "@/lib/api/client";

function StatCard({
  title,
  value,
  icon,
  scrollToId,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  /** Fragment e.g. `#admin-students` — card becomes a link that jumps to that section */
  scrollToId?: string;
}) {
  const inner = (
    <>
      <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient opacity-90" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 shadow-sm">{icon}</div>
      </div>
      <p className="font-display mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </>
  );

  const className =
    "group relative block overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2";

  if (scrollToId) {
    return (
      <a href={scrollToId} className={className}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [admins, setAdmins] = useState<AdminStudent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<AdminStudentProfile | null>(
    null
  );
  const [assignForm, setAssignForm] = useState({
    courseId: "",
    planType: "BASIC",
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    difficulty: "BEGINNER",
    durationHours: "20",
    subjectId: "",
    premium: false,
  });

  const [editingEnrollmentId, setEditingEnrollmentId] = useState<number | null>(null);
  const [enrollmentEditForm, setEnrollmentEditForm] = useState({
    planType: "BASIC",
    status: "ACTIVE",
    progressPercentage: 0,
    lessonsLeft: 0,
  });

  /** Cancels prior student-profile fetch when switching students so stale responses do not overwrite the UI. */
  const studentProfileFetchRef = useRef<AbortController | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  async function handleLogout() {
    try {
      await logoutUser(token ?? undefined);
    } catch {
      // Clear client auth state even if backend logout call fails.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      router.push("/login");
    }
  }

  async function loadData() {
    if (!token || role !== "ADMIN") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [overviewData, studentData, adminData, subjectData, courseData] =
        await Promise.all([
          getAdminOverview(token),
          getAdminStudents(token),
          getAdminAdmins(token),
          getAdminSubjects(token),
          getAdminCourses(token),
        ]);
      setOverview(overviewData);
      setStudents(studentData);
      setAdmins(adminData);
      setSubjects(subjectData);
      setCourses(courseData);
      setIsAuthChecking(false);
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subjectOptions = useMemo(
    () => subjects.map((subject) => ({ label: subject.name, value: String(subject.id) })),
    [subjects]
  );

  if (isAuthChecking) {
    return <PageLoader message="Loading admin console…" />;
  }

  async function onCreateSubject() {
    if (!token) return;
    setError("");
    setSuccess("");
    try {
      await createSubject(token, subjectForm);
      setSuccess("Subject created successfully.");
      setSubjectForm({ name: "", slug: "", description: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subject");
    }
  }

  async function onCreateCourse() {
    if (!token) return;
    setError("");
    setSuccess("");
    try {
      await createCourse(token, {
        title: courseForm.title,
        slug: courseForm.slug,
        description: courseForm.description,
        difficulty: courseForm.difficulty,
        durationHours: Number(courseForm.durationHours),
        subjectId: Number(courseForm.subjectId),
        premium: courseForm.premium,
      });
      setSuccess("Course created successfully.");
      setCourseForm({
        title: "",
        slug: "",
        description: "",
        difficulty: "BEGINNER",
        durationHours: "20",
        subjectId: "",
        premium: false,
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    }
  }

  async function openStudentProfile(studentId: number) {
    if (!token) return;
    studentProfileFetchRef.current?.abort();
    const controller = new AbortController();
    studentProfileFetchRef.current = controller;
    setError("");
    setEditingEnrollmentId(null);
    try {
      const profile = await getAdminStudentProfile(token, studentId, controller.signal);
      if (studentProfileFetchRef.current !== controller) return;
      setSelectedStudentId(studentId);
      setSelectedStudentProfile(profile);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) return;
      setError(extractErrorMessage(err, "Failed to load student profile"));
    }
  }

  async function onAssignCourseToStudent() {
    if (!token || !selectedStudentId) return;
    setError("");
    setSuccess("");
    try {
      const updated = await assignCourseToStudent(token, selectedStudentId, {
        courseId: Number(assignForm.courseId),
        planType: assignForm.planType,
      });
      setSelectedStudentProfile(updated);
      setSuccess("Course assigned to student successfully.");
      setAssignForm({ courseId: "", planType: "BASIC" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign course");
    }
  }

  async function onRemoveCourseFromStudent(enrollmentId: number) {
    if (!token || !selectedStudentId) return;
    setError("");
    setSuccess("");
    try {
      const updated = await removeCourseFromStudent(token, selectedStudentId, enrollmentId);
      setSelectedStudentProfile(updated);
      setSuccess("Course removed from student.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove course");
    }
  }

  async function onDeleteStudent() {
    if (!token || !selectedStudentId) return;
    const confirmed = window.confirm("Delete this student and all related enrollments?");
    if (!confirmed) return;
    setError("");
    setSuccess("");
    try {
      await deleteStudent(token, selectedStudentId);
      setSuccess("Student deleted successfully.");
      setSelectedStudentId(null);
      setSelectedStudentProfile(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    }
  }

  function startEnrollmentEdit(item: StudentEnrollment) {
    setError("");
    setSuccess("");
    setEditingEnrollmentId(item.enrollmentId);
    setEnrollmentEditForm({
      planType: item.planType,
      status: item.status,
      progressPercentage: item.progress,
      lessonsLeft: item.lessonsLeft,
    });
  }

  function cancelEnrollmentEdit() {
    setEditingEnrollmentId(null);
  }

  async function onSaveEnrollmentEdit() {
    if (!token || !selectedStudentId || editingEnrollmentId === null) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const profile = await updateStudentEnrollment(
        token,
        selectedStudentId,
        editingEnrollmentId,
        {
          planType: enrollmentEditForm.planType,
          status: enrollmentEditForm.status,
          progressPercentage: enrollmentEditForm.progressPercentage,
          lessonsLeft: enrollmentEditForm.lessonsLeft,
        }
      );
      setSelectedStudentProfile(profile);
      setEditingEnrollmentId(null);
      setSuccess("Enrollment updated.");
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update enrollment."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4f6fb] p-4 md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(99,102,241,0.09),transparent_50%)]" />
      <div className="relative mx-auto max-w-[1400px] space-y-5">
        <header className="relative rounded-[1.75rem] border border-white/20 bg-brand-gradient p-6 text-white shadow-[0_28px_60px_-24px_rgba(79,70,229,0.45)] md:p-8">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/85">Administrative Control Center</p>
              <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
                Place2Prepare Admin Dashboard
              </h1>
              <p className="mt-2 text-sm text-white/90">
                Manage courses, subjects, and students with full platform visibility.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Super Admin Access
            </div>
            <Link
              href="/admin/live-sessions"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white/95 transition hover:bg-white/10"
            >
              <Video className="h-4 w-4" />
              Live sessions
            </Link>
            {token ? <NotificationBell token={token} tone="dark" /> : null}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white/95 transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        {error ? (
          <p className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-sm">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm">
            {success}
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Students"
            value={overview?.totalStudents ?? 0}
            icon={<Users className="h-4 w-4" />}
            scrollToId="#admin-students"
          />
          <StatCard
            title="Total Admins"
            value={overview?.totalAdmins ?? 0}
            icon={<ShieldCheck className="h-4 w-4" />}
            scrollToId="#admin-admins"
          />
          <StatCard
            title="Total Subjects"
            value={overview?.totalSubjects ?? 0}
            icon={<GraduationCap className="h-4 w-4" />}
            scrollToId="#admin-subjects"
          />
          <StatCard
            title="Total Courses"
            value={overview?.totalCourses ?? 0}
            icon={<BookOpen className="h-4 w-4" />}
            scrollToId="#admin-course-catalog"
          />
          <StatCard
            title="Total Enrollments"
            value={overview?.totalEnrollments ?? 0}
            icon={<Activity className="h-4 w-4" />}
            scrollToId="#admin-enrollments"
          />
        </section>

        <section
          id="admin-admins"
          className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Administrators</h2>
              <p className="mt-1 text-sm text-slate-500">
                Accounts with admin access ({admins.length} shown). Student accounts are listed separately below.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{admin.fullName}</p>
                  <p className="text-xs text-slate-500">{admin.email}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
                  {admin.role}
                </span>
              </div>
            ))}
            {admins.length === 0 ? (
              <p className="text-sm text-slate-500">No administrator accounts yet.</p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div
            id="admin-subjects"
            className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">Add New Subject</h2>
            <div className="mt-4 space-y-3">
              <Input
                label="Subject name"
                placeholder="Computer Organization"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Slug"
                placeholder="computer-organization"
                value={subjectForm.slug}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <Input
                label="Description"
                placeholder="High-level subject description"
                value={subjectForm.description}
                onChange={(e) =>
                  setSubjectForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <Button onClick={onCreateSubject} className="w-full" loading={loading}>
                Create Subject
              </Button>
            </div>
          </div>

          <div
            id="admin-add-course"
            className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">Add New Course</h2>
            <div className="mt-4 space-y-3">
              <Input
                label="Course title"
                placeholder="Operating Systems for Placements"
                value={courseForm.title}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Input
                label="Course slug"
                placeholder="os-for-placements"
                value={courseForm.slug}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <Input
                label="Description"
                placeholder="Course summary"
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Difficulty</label>
                  <select
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                    value={courseForm.difficulty}
                    onChange={(e) =>
                      setCourseForm((prev) => ({ ...prev, difficulty: e.target.value }))
                    }
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
                <Input
                  label="Duration (hours)"
                  type="number"
                  value={courseForm.durationHours}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, durationHours: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Subject</label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                  value={courseForm.subjectId}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                >
                  <option value="">Select subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={courseForm.premium}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, premium: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Premium-only course (requires PREMIUM plan to access)
              </label>
              <Button onClick={onCreateCourse} className="w-full" loading={loading}>
                Create Course
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div
            id="admin-students"
            className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900">Students</h3>
            <div className="mt-3 space-y-2">
              {students.map((student) => (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => openStudentProfile(student.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    selectedStudentId === student.id
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{student.fullName}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                    {student.role}
                  </span>
                </button>
              ))}
              {students.length === 0 ? <p className="text-sm text-slate-500">No students found.</p> : null}
            </div>
          </div>

          <div
            id="admin-course-catalog"
            className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900">Courses Catalog</h3>
            <div className="mt-3 space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {course.title}
                      </p>
                      {course.premium ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          <Sparkles className="h-2.5 w-2.5" />
                          Premium
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      {course.subject} - {course.difficulty} - {course.durationHours}h
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/admin/courses/${course.id}/lessons`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                    >
                      <FileText className="h-3 w-3" />
                      Lessons
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/quizzes`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                    >
                      <Brain className="h-3 w-3" />
                      Quizzes
                    </Link>
                  </div>
                </div>
              ))}
              {courses.length === 0 ? <p className="text-sm text-slate-500">No courses available.</p> : null}
            </div>
          </div>
        </section>

        <section
          id="admin-enrollments"
          className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900">Student Profile & Course Access</h3>
          {!selectedStudentProfile ? (
            <p className="mt-2 text-sm text-slate-500">
              Click on a student from the list to view profile, plans, and enrollments.
            </p>
          ) : (
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Name:</span>{" "}
                  {selectedStudentProfile.fullName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Email:</span>{" "}
                  {selectedStudentProfile.email}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Role:</span>{" "}
                  {selectedStudentProfile.role}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Courses Bought:</span>{" "}
                  {selectedStudentProfile.totalCourses}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={onDeleteStudent}
                >
                  Delete Student
                </Button>
              </div>

              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900">Assign Course to Student</h4>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Course</label>
                  <select
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                    value={assignForm.courseId}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, courseId: e.target.value }))}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Plan Type</label>
                  <select
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                    value={assignForm.planType}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, planType: e.target.value }))}
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                <Button className="w-full" onClick={onAssignCourseToStudent}>
                  Assign Course
                </Button>
              </div>

              <div className="lg:col-span-2">
                <h4 className="font-semibold text-slate-900">Enrolled Courses</h4>
                <div className="mt-3 space-y-3">
                  {selectedStudentProfile.enrolledCourses.map((item) => {
                    const courseMeta = courses.find((c) => c.id === item.courseId);
                    const requiresPremium = courseMeta?.premium === true;
                    const isEditing = editingEnrollmentId === item.enrollmentId;

                    return (
                      <div
                        key={item.enrollmentId}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.courseTitle}</p>
                            <p className="text-xs text-slate-500">
                              {item.subject} · {item.lessonsLeft} lessons left
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {!isEditing ? (
                              <>
                                <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                                  {item.planType}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                  {item.status}
                                </span>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  onClick={() => startEnrollmentEdit(item)}
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                  onClick={() => onRemoveCourseFromStudent(item.enrollmentId)}
                                >
                                  Remove
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {!isEditing ? (
                          <p className="mt-2 text-xs text-slate-600">
                            Progress: <span className="font-semibold">{item.progress}%</span>
                          </p>
                        ) : (
                          <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-700">Plan type</label>
                              <select
                                className="h-10 w-full rounded-lg border border-input bg-white px-2 text-sm"
                                value={enrollmentEditForm.planType}
                                onChange={(e) =>
                                  setEnrollmentEditForm((p) => ({ ...p, planType: e.target.value }))
                                }
                              >
                                <option value="BASIC" disabled={requiresPremium}>
                                  BASIC
                                </option>
                                <option value="PREMIUM">PREMIUM</option>
                              </select>
                              {requiresPremium ? (
                                <p className="text-[11px] text-amber-700">
                                  This course requires PREMIUM access.
                                </p>
                              ) : null}
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-700">Status</label>
                              <select
                                className="h-10 w-full rounded-lg border border-input bg-white px-2 text-sm"
                                value={enrollmentEditForm.status}
                                onChange={(e) =>
                                  setEnrollmentEditForm((p) => ({ ...p, status: e.target.value }))
                                }
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="COMPLETED">COMPLETED</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-700">
                                Progress (%)
                              </label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={String(enrollmentEditForm.progressPercentage)}
                                onChange={(e) =>
                                  setEnrollmentEditForm((p) => ({
                                    ...p,
                                    progressPercentage: Number.parseInt(e.target.value, 10) || 0,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-700">
                                Lessons left
                              </label>
                              <Input
                                type="number"
                                min={0}
                                value={String(enrollmentEditForm.lessonsLeft)}
                                onChange={(e) =>
                                  setEnrollmentEditForm((p) => ({
                                    ...p,
                                    lessonsLeft: Number.parseInt(e.target.value, 10) || 0,
                                  }))
                                }
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 sm:col-span-2">
                              <Button type="button" size="sm" onClick={onSaveEnrollmentEdit} loading={loading}>
                                Save changes
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelEnrollmentEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {selectedStudentProfile.enrolledCourses.length === 0 ? (
                    <p className="text-sm text-slate-500">No courses assigned yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
