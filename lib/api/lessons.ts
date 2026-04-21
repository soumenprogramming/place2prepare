import { apiRequest } from "./client";

export type LessonSummary = {
  id: number;
  title: string;
  slug: string;
  position: number;
  durationMinutes: number;
  completed: boolean;
};

export type LessonList = {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: LessonSummary[];
};

export type LessonDetail = {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  slug: string;
  position: number;
  durationMinutes: number;
  contentMarkdown: string;
  videoUrl: string | null;
  completed: boolean;
  previousLessonId: number | null;
  nextLessonId: number | null;
};

export type LessonCompletionResult = {
  lessonId: number;
  completed: boolean;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lessonsLeft: number;
  enrollmentStatus: string;
};

export function getLessons(token: string, courseId: number | string) {
  return apiRequest<LessonList>(
    `/api/v1/learn/courses/${courseId}/lessons`,
    { token }
  );
}

export function getLesson(
  token: string,
  courseId: number | string,
  lessonId: number | string
) {
  return apiRequest<LessonDetail>(
    `/api/v1/learn/courses/${courseId}/lessons/${lessonId}`,
    { token }
  );
}

export function setLessonCompletion(
  token: string,
  courseId: number | string,
  lessonId: number | string,
  completed: boolean
) {
  return apiRequest<LessonCompletionResult>(
    `/api/v1/learn/courses/${courseId}/lessons/${lessonId}/complete`,
    {
      method: "POST",
      token,
      body: { completed },
    }
  );
}
