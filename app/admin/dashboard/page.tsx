"use client";

import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/lib/api/auth";
import NotificationBell from "@/components/notifications/notification-bell";
import {
  assignCourseToStudent,
  deleteStudent,
  createCourse,
  createSubject,
  getAdminCourses,
  getAdminOverview,
  getAdminStudentProfile,
  getAdminStudents,
  getAdminSubjects,
  removeCourseFromStudent,
  type AdminOverview,
  type AdminStudentProfile,
  type AdminStudent,
  type Course,
  type Subject,
} from "@/lib/api/admin";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
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
      const [overviewData, studentData, subjectData, courseData] = await Promise.all([
        getAdminOverview(token),
        getAdminStudents(token),
        getAdminSubjects(token),
        getAdminCourses(token),
      ]);
      setOverview(overviewData);
      setStudents(studentData);
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
    return null;
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
    setError("");
    try {
      const profile = await getAdminStudentProfile(token, studentId);
      setSelectedStudentId(studentId);
      setSelectedStudentProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student profile");
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

  return (
    <main className="min-h-screen app-shell-bg p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/85">Administrative Control Center</p>
              <h1 className="mt-1 text-3xl font-bold">Place2Prepare Admin Dashboard</h1>
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
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Students" value={overview?.totalStudents ?? 0} icon={<Users className="h-4 w-4" />} />
          <StatCard title="Total Admins" value={overview?.totalAdmins ?? 0} icon={<ShieldCheck className="h-4 w-4" />} />
          <StatCard title="Total Subjects" value={overview?.totalSubjects ?? 0} icon={<GraduationCap className="h-4 w-4" />} />
          <StatCard title="Total Courses" value={overview?.totalCourses ?? 0} icon={<BookOpen className="h-4 w-4" />} />
          <StatCard title="Total Enrollments" value={overview?.totalEnrollments ?? 0} icon={<Activity className="h-4 w-4" />} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                <div className="mt-3 space-y-2">
                  {selectedStudentProfile.enrolledCourses.map((item) => (
                    <div
                      key={item.enrollmentId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.courseTitle}</p>
                        <p className="text-xs text-slate-500">
                          {item.subject} - {item.status} - {item.progress}% progress
                        </p>
                      </div>
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                        {item.planType}
                      </span>
                      <button
                        type="button"
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => onRemoveCourseFromStudent(item.enrollmentId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
