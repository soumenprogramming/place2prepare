package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

public record LessonCompletionResponse(
        Long lessonId,
        boolean completed,
        int completedLessons,
        int totalLessons,
        int progressPercentage,
        int lessonsLeft,
        String enrollmentStatus
) {
}
