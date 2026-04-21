package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

public record LessonDetailResponse(
        Long id,
        Long courseId,
        String courseTitle,
        String title,
        String slug,
        int position,
        int durationMinutes,
        String contentMarkdown,
        String videoUrl,
        boolean completed,
        Long previousLessonId,
        Long nextLessonId
) {
}
