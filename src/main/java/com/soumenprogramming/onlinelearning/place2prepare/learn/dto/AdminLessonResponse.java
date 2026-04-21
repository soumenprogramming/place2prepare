package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

import java.time.Instant;

public record AdminLessonResponse(
        Long id,
        Long courseId,
        String title,
        String slug,
        int position,
        int durationMinutes,
        String contentMarkdown,
        String videoUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
