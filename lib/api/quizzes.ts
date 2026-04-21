import { apiRequest } from "./client";

export type QuizSummary = {
  id: number;
  title: string;
  slug: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questionCount: number;
  attemptCount: number;
  bestScorePercent: number | null;
  lastScorePercent: number | null;
  lastAttemptStatus: string | null;
  inProgressAttemptId: number | null;
};

export type QuizListResponse = {
  courseId: number;
  courseTitle: string;
  totalQuizzes: number;
  quizzes: QuizSummary[];
};

export type AttemptOption = {
  id: number;
  text: string;
  position: number;
  correct: boolean | null;
  selected: boolean;
};

export type AttemptQuestion = {
  id: number;
  prompt: string;
  position: number;
  explanation: string | null;
  correct: boolean | null;
  options: AttemptOption[];
};

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";

export type AttemptResponse = {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseTitle: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  timeLimitMinutes: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  passingScorePercent: number;
  passed: boolean;
  questions: AttemptQuestion[];
};

export type AttemptHistoryItem = {
  attemptId: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  passed: boolean;
};

export type SubmitAttemptPayload = {
  answers: Array<{ questionId: number; optionId: number | null }>;
};

export function getCourseQuizzes(token: string, courseId: number | string) {
  return apiRequest<QuizListResponse>(
    `/api/v1/learn/courses/${courseId}/quizzes`,
    { token }
  );
}

export function startQuizAttempt(
  token: string,
  courseId: number | string,
  quizId: number | string
) {
  return apiRequest<AttemptResponse>(
    `/api/v1/learn/courses/${courseId}/quizzes/${quizId}/attempts`,
    { method: "POST", token }
  );
}

export function getQuizAttempt(token: string, attemptId: number | string) {
  return apiRequest<AttemptResponse>(`/api/v1/learn/attempts/${attemptId}`, {
    token,
  });
}

export function submitQuizAttempt(
  token: string,
  attemptId: number | string,
  payload: SubmitAttemptPayload
) {
  return apiRequest<AttemptResponse>(
    `/api/v1/learn/attempts/${attemptId}/submit`,
    { method: "POST", token, body: payload }
  );
}

export function getQuizHistory(
  token: string,
  courseId: number | string,
  quizId: number | string
) {
  return apiRequest<AttemptHistoryItem[]>(
    `/api/v1/learn/courses/${courseId}/quizzes/${quizId}/history`,
    { token }
  );
}
