import { apiRequest } from "./client";

export type AdminOverview = {
  totalStudents: number;
  totalAdmins: number;
  totalSubjects: number;
  totalCourses: number;
  totalEnrollments: number;
};

export type AdminStudent = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type StudentEnrollment = {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  subject: string;
  progress: number;
  lessonsLeft: number;
  planType: string;
  status: string;
};

export type AdminStudentProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  totalCourses: number;
  enrolledCourses: StudentEnrollment[];
};

export type Subject = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type Course = {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  durationHours: number;
  subject: string;
  premium: boolean;
};

export type AdminLesson = {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  position: number;
  durationMinutes: number;
  contentMarkdown: string;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLessonPayload = {
  title: string;
  slug: string;
  contentMarkdown: string;
  videoUrl?: string | null;
  durationMinutes: number;
  position?: number | null;
};

export function getAdminOverview(token: string) {
  return apiRequest<AdminOverview>("/api/v1/admin/overview", { token });
}

export function getAdminStudents(token: string) {
  return apiRequest<AdminStudent[]>("/api/v1/admin/students", { token });
}

export function getAdminAdmins(token: string) {
  return apiRequest<AdminStudent[]>("/api/v1/admin/admins", { token });
}

export function getAdminSubjects(token: string) {
  return apiRequest<Subject[]>("/api/v1/admin/subjects", { token });
}

export function createSubject(
  token: string,
  payload: { name: string; slug: string; description: string }
) {
  return apiRequest<Subject>("/api/v1/admin/subjects", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getAdminCourses(token: string) {
  return apiRequest<Course[]>("/api/v1/admin/courses", { token });
}

export function createCourse(
  token: string,
  payload: {
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    durationHours: number;
    subjectId: number;
    premium?: boolean;
  }
) {
  return apiRequest<Course>("/api/v1/admin/courses", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getAdminLessons(token: string, courseId: number | string) {
  return apiRequest<AdminLesson[]>(
    `/api/v1/admin/courses/${courseId}/lessons`,
    { token }
  );
}

export function createAdminLesson(
  token: string,
  courseId: number | string,
  payload: AdminLessonPayload
) {
  return apiRequest<AdminLesson>(
    `/api/v1/admin/courses/${courseId}/lessons`,
    { method: "POST", token, body: payload }
  );
}

export function updateAdminLesson(
  token: string,
  courseId: number | string,
  lessonId: number | string,
  payload: AdminLessonPayload
) {
  return apiRequest<AdminLesson>(
    `/api/v1/admin/courses/${courseId}/lessons/${lessonId}`,
    { method: "PUT", token, body: payload }
  );
}

export function deleteAdminLesson(
  token: string,
  courseId: number | string,
  lessonId: number | string
) {
  return apiRequest<{ message: string }>(
    `/api/v1/admin/courses/${courseId}/lessons/${lessonId}`,
    { method: "DELETE", token }
  );
}

export function getAdminStudentProfile(
  token: string,
  studentId: number,
  signal?: AbortSignal
) {
  return apiRequest<AdminStudentProfile>(`/api/v1/admin/students/${studentId}`, {
    token,
    signal,
  });
}

export function assignCourseToStudent(
  token: string,
  studentId: number,
  payload: { courseId: number; planType: string }
) {
  return apiRequest<AdminStudentProfile>(
    `/api/v1/admin/students/${studentId}/courses`,
    { method: "POST", token, body: payload }
  );
}

export function removeCourseFromStudent(
  token: string,
  studentId: number,
  enrollmentId: number
) {
  return apiRequest<AdminStudentProfile>(
    `/api/v1/admin/students/${studentId}/courses/${enrollmentId}`,
    { method: "DELETE", token }
  );
}

export function updateStudentEnrollment(
  token: string,
  studentId: number,
  enrollmentId: number,
  payload: {
    planType?: string;
    status?: string;
    progressPercentage?: number;
    lessonsLeft?: number;
  }
) {
  return apiRequest<AdminStudentProfile>(
    `/api/v1/admin/students/${studentId}/courses/${enrollmentId}`,
    { method: "PUT", token, body: payload }
  );
}

export function deleteStudent(token: string, studentId: number) {
  return apiRequest<{ message: string }>(`/api/v1/admin/students/${studentId}`, {
    method: "DELETE",
    token,
  });
}

export type AdminOption = {
  id: number;
  text: string;
  correct: boolean;
  position: number;
};

export type AdminQuestion = {
  id: number;
  quizId: number;
  prompt: string;
  explanation: string | null;
  position: number;
  options: AdminOption[];
};

export type AdminQuiz = {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  slug: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  published: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  questions: AdminQuestion[];
};

export type AdminQuizPayload = {
  title: string;
  slug: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  published: boolean;
};

export type AdminQuestionPayload = {
  prompt: string;
  explanation?: string | null;
  position?: number | null;
  options: Array<{
    text: string;
    correct: boolean;
    position?: number | null;
  }>;
};

export function getAdminQuizzes(token: string, courseId: number | string) {
  return apiRequest<AdminQuiz[]>(
    `/api/v1/admin/courses/${courseId}/quizzes`,
    { token }
  );
}

export function getAdminQuiz(
  token: string,
  courseId: number | string,
  quizId: number | string
) {
  return apiRequest<AdminQuiz>(
    `/api/v1/admin/courses/${courseId}/quizzes/${quizId}`,
    { token }
  );
}

export function createAdminQuiz(
  token: string,
  courseId: number | string,
  payload: AdminQuizPayload
) {
  return apiRequest<AdminQuiz>(
    `/api/v1/admin/courses/${courseId}/quizzes`,
    { method: "POST", token, body: payload }
  );
}

export function updateAdminQuiz(
  token: string,
  courseId: number | string,
  quizId: number | string,
  payload: AdminQuizPayload
) {
  return apiRequest<AdminQuiz>(
    `/api/v1/admin/courses/${courseId}/quizzes/${quizId}`,
    { method: "PUT", token, body: payload }
  );
}

export function deleteAdminQuiz(
  token: string,
  courseId: number | string,
  quizId: number | string
) {
  return apiRequest<void>(
    `/api/v1/admin/courses/${courseId}/quizzes/${quizId}`,
    { method: "DELETE", token }
  );
}

export function addAdminQuestion(
  token: string,
  courseId: number | string,
  quizId: number | string,
  payload: AdminQuestionPayload
) {
  return apiRequest<AdminQuestion>(
    `/api/v1/admin/courses/${courseId}/quizzes/${quizId}/questions`,
    { method: "POST", token, body: payload }
  );
}

export function updateAdminQuestion(
  token: string,
  courseId: number | string,
  quizId: number | string,
  questionId: number | string,
  payload: AdminQuestionPayload
) {
  return apiRequest<AdminQuestion>(
    `/api/v1/admin/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`,
    { method: "PUT", token, body: payload }
  );
}

export function deleteAdminQuestion(
  token: string,
  courseId: number | string,
  quizId: number | string,
  questionId: number | string
) {
  return apiRequest<void>(
    `/api/v1/admin/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`,
    { method: "DELETE", token }
  );
}

export type AdminLiveSession = {
  id: number;
  title: string;
  description: string | null;
  instructorName: string | null;
  courseId: number | null;
  courseTitle: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  joinUrl: string | null;
  joinable: boolean;
  accessReason: string | null;
};

export type AdminLiveSessionPayload = {
  title: string;
  description?: string | null;
  instructorName?: string | null;
  courseId?: number | null;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl?: string | null;
  status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
};

export function getAdminLiveSessions(token: string) {
  return apiRequest<AdminLiveSession[]>("/api/v1/admin/live-sessions", {
    token,
  });
}

export function createAdminLiveSession(
  token: string,
  payload: AdminLiveSessionPayload
) {
  return apiRequest<AdminLiveSession>("/api/v1/admin/live-sessions", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateAdminLiveSession(
  token: string,
  id: number | string,
  payload: AdminLiveSessionPayload
) {
  return apiRequest<AdminLiveSession>(`/api/v1/admin/live-sessions/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteAdminLiveSession(
  token: string,
  id: number | string
) {
  return apiRequest<void>(`/api/v1/admin/live-sessions/${id}`, {
    method: "DELETE",
    token,
  });
}
