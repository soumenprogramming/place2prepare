package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

import java.util.List;

public record LessonListResponse(
        Long courseId,
        String courseTitle,
        int totalLessons,
        int completedLessons,
        int progressPercentage,
        List<LessonSummary> lessons
) {
}
