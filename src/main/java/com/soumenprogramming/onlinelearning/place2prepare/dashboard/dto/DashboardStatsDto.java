package com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto;

public record DashboardStatsDto(
        int learningStreakDays,
        long enrolledCourses,
        int upcomingInterviews,
        String weeklyLearningTime
) {
}
