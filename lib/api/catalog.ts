import { apiRequest } from "./client";

export type CatalogSubject = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type CatalogCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  durationHours: number;
  subject: string;
  premium: boolean;
};

export function getCatalogSubjects() {
  return apiRequest<CatalogSubject[]>("/api/v1/public/subjects");
}

export function getCatalogCourses(params: { subject?: string; q?: string } = {}) {
  const query = new URLSearchParams();
  if (params.subject) query.set("subject", params.subject);
  if (params.q) query.set("q", params.q);
  const suffix = query.toString();
  return apiRequest<CatalogCourse[]>(
    `/api/v1/public/courses${suffix ? `?${suffix}` : ""}`
  );
}
