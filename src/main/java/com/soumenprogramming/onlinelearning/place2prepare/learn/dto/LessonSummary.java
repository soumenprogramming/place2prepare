package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

public record LessonSummary(
        Long id,
        String title,
        String slug,
        int position,
        int durationMinutes,
        boolean completed
) {
}
