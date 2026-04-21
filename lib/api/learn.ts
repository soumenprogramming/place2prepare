import { apiRequest } from "./client";

export type CourseDetail = {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  durationHours: number;
  subject: string;
  premium: boolean;
};

export type CourseAccessState =
  | "ALLOWED"
  | "NOT_ENROLLED"
  | "PLAN_REQUIRED"
  | "INACTIVE";

export type CourseAccessResponse = {
  course: CourseDetail;
  accessState: CourseAccessState;
  reason: string | null;
  planType: string | null;
  enrollmentId: number | null;
  progress: number | null;
  lessonsLeft: number | null;
};

export function getCourseAccess(token: string, courseId: number | string) {
  return apiRequest<CourseAccessResponse>(
    `/api/v1/learn/courses/${courseId}`,
    { token }
  );
}
