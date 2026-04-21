import { apiRequest } from "./client";

export type LandingData = {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  topSubjects: string[];
};

export type EnrolledCourse = {
  enrollmentId: number;
  courseId: number;
  title: string;
  progress: number;
  lessonsLeft: number;
  planType: string;
  status: string;
};

export type DashboardOverview = {
  fullName: string;
  stats: {
    learningStreakDays: number;
    enrolledCourses: number;
    upcomingInterviews: number;
    weeklyLearningTime: string;
  };
  activeCourses: EnrolledCourse[];
  upcomingSchedule: Array<{
    id: number;
    title: string;
    time: string;
    scheduledAt: string;
    durationMinutes: number;
    status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
    courseId: number | null;
    courseTitle: string | null;
    joinUrl: string | null;
    joinable: boolean;
  }>;
  recentActivity: string[];
};

export function getLandingData() {
  return apiRequest<LandingData>("/api/v1/public/landing");
}

export function getDashboardOverview(token: string) {
  return apiRequest<DashboardOverview>("/api/v1/dashboard/overview", { token });
}
