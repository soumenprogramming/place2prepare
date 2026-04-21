import { apiRequest } from "./client";

export type LiveSessionStatus =
  | "SCHEDULED"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export type LiveSession = {
  id: number;
  title: string;
  description: string | null;
  instructorName: string | null;
  courseId: number | null;
  courseTitle: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveSessionStatus;
  joinUrl: string | null;
  joinable: boolean;
  accessReason: string | null;
};

export type LiveSessionCalendar = {
  upcoming: LiveSession[];
  past: LiveSession[];
};

export function getLiveSessionCalendar(token: string) {
  return apiRequest<LiveSessionCalendar>("/api/v1/learn/live-sessions", {
    token,
  });
}

export function getCourseLiveSessions(courseId: number, token: string) {
  return apiRequest<LiveSession[]>(
    `/api/v1/learn/courses/${courseId}/live-sessions`,
    { token }
  );
}
